import  { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Search, ChevronDown, ChevronUp, XCircle, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogEntry } from './LogEntry';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover components

interface Log {
  id: string;
  entityType: string;
  entityName: string;
  status: string;
  message: string;
  transactionId: string;
  qoyodInvoiceId?: string;
  timestamp: string;
  errorCode?: string | null;
  errorDetails?: string | null;
}

const API_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': '1',
};

export function Dashboard() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>({ // Updated to DateRange type
    from: subDays(new Date(), 3),
    to: new Date(),
  });

  useEffect(() => {
    fetchLogs();
  }, [filterDateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const formattedStartDate = filterDateRange?.from ? format(filterDateRange.from, 'yyyy-MM-dd') : ''; // Optional chaining and type safety
      const formattedEndDate = filterDateRange?.to ? format(filterDateRange.to, 'yyyy-MM-dd') : '';

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/dashboard/logs?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        {
          headers: API_HEADERS,
        }
      );
      if (!response.ok) throw new Error('فشل في جلب السجلات');
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error: any) {
      console.error('خطأ في جلب السجلات:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissError = async (transactionId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/logs/dismiss/${transactionId}`, {
        method: 'PUT',
        headers: API_HEADERS
      });
      if (!response.ok) {
        throw new Error('فشل في تجاهل الخطأ للمعاملة');
      }
      setLogs(prevLogs => prevLogs.map(log =>
          log.transactionId === transactionId ? { ...log, errorCode: null, errorDetails: null } : log
      ));
      setShowErrorSummary(true);
    } catch (error: any) {
      console.error('خطأ أثناء تجاهل الخطأ:', error.message);
    }
  };

  const filteredLogs = logs.filter((log) =>
    searchQuery
      ? log.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const groupedLogs = filteredLogs.reduce((acc, log) => {
    if (!acc[log.transactionId]) {
      acc[log.transactionId] = [];
    }
    acc[log.transactionId].push(log);
    return acc;
  }, {} as Record<string, Log[]>);

  const failedTransactions = Object.entries(groupedLogs).filter(([_, logs]) =>
      logs.some(log => (log.status.toLowerCase() === 'failed' || log.status.toLowerCase() === 'syncfailed') && log.errorCode !== null)
  );

  return (
    <div className="flex-1 p-8 overflow-auto" dir="rtl" lang="ar">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Error Summary Card */}
        {failedTransactions.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-red-700 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {`المعاملات الفاشلة`}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowErrorSummary(!showErrorSummary)}
                  className="text-red-700"
                >
                  {showErrorSummary ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </div>
            </CardHeader>
            {showErrorSummary && (
              <CardContent>
                <div className="space-y-4">
                  {failedTransactions.map(([transactionId, logs]) => {
                    const failedLogs = logs.filter(log =>
                      (log.status.toLowerCase() === 'failed' || log.status.toLowerCase() === 'syncfailed') && log.errorCode !== null
                    );
                    if (failedLogs.length === 0) return null;
                    return (
                      <Alert variant="destructive" key={transactionId}>
                        <AlertTitle>{`المعاملة: ${transactionId}`}</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside space-y-1 mt-2">
                            {failedLogs.map((log) => (
                              <li key={log.id} className="text-sm">
                                {`${log.entityType}: ${log.message}`}
                              </li>
                            ))}
                          </ul>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleDismissError(transactionId)}
                          >
                            <XCircle className="h-4 w-4 mr-2" /> تجاهل الخطأ للمعاملة
                          </Button>
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Search and Logs Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4"> {/* Flex container for search and date filter */}
              <div className="relative w-1/2"> {/* Take half width for search */}
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث برقم المعاملة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Popover> {/* Popover for Date Range Picker */}
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9 px-3 ml-2"> {/* Added ml-2 for spacing */}
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDateRange?.from && filterDateRange.to ? (
                      <>
                        {format(filterDateRange.from, 'yyyy-MM-dd', { locale: arSA })} - {format(filterDateRange.to, 'yyyy-MM-dd', { locale: arSA })} {/* Arabic Date format */}
                      </>
                    ) : (
                      <span>{`اختر التاريخ`}</span> // Arabic: Choose Date
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    locale={arSA} // Set Arabic locale for date picker
                    defaultMonth={filterDateRange?.from || undefined}
                    selected={filterDateRange}
                    onSelect={setFilterDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>


            <h2 className="text-2xl font-bold mb-6">{`سجلات المعاملات`}</h2>
            {loading ? (
              <p>{`جارٍ تحميل السجلات...`}</p>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {Object.entries(groupedLogs).map(([transactionId, logs]) => (
                  <AccordionItem
                    key={transactionId}
                    value={transactionId}
                    className="border rounded-lg"
                  >
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold">
                          {`المعاملة: ${transactionId}`}
                        </span>
                        <span className="text-sm text-gray-500">
                        {format(new Date(logs[0].timestamp), 'PP', { locale: arSA })}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <Tabs defaultValue="payment">
                        <TabsList className="mb-4">
                          <TabsTrigger value="payment">{`الدفع`}</TabsTrigger>
                          <TabsTrigger value="qoyod">{`قيود`}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="payment">
                          <div className="space-y-4">
                            {logs
                              .filter((log) => log.entityType === 'PAYMENT')
                              .map((log) => (
                                <LogEntry key={log.id} log={log} />
                              ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="qoyod">
                          <div className="space-y-4">
                            {logs
                              .filter(
                                (log) =>
                                  log.entityType !== 'PAYMENT' &&
                                  log.entityType !== 'Product'
                              )
                              .map((log) => (
                                <LogEntry key={log.id} log={log} />
                              ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}