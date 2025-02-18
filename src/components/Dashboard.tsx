import { useState, useEffect } from 'react';
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
import { AlertCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogEntry } from './LogEntry';

interface Log {
  id: string;
  entityType: string;
  entityName: string;
  status: string;
  message: string;
  transactionId: string;
  qoyodInvoiceId?: string;
  timestamp: string;
}

const API_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': '1'
};

export function Dashboard() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrorSummary, setShowErrorSummary] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/logs`, {
        headers: API_HEADERS
      });
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs based on search query
  const filteredLogs = logs.filter(log => 
    searchQuery ? log.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  // Group logs by transactionId
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    if (!acc[log.transactionId]) {
      acc[log.transactionId] = [];
    }
    acc[log.transactionId].push(log);
    return acc;
  }, {} as Record<string, Log[]>);

  // Get failed transactions for error summary
  const failedTransactions = Object.entries(groupedLogs).filter(([_, logs]) =>
    logs.some(log => 
      log.status.toLowerCase() === 'failed' || 
      log.status.toLowerCase() === 'syncfailed'
    )
  );

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Error Summary Card */}
        {failedTransactions.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-red-700 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Failed Transactions
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
                      log.status.toLowerCase() === 'failed' || 
                      log.status.toLowerCase() === 'syncfailed'
                    );
                    return (
                      <Alert variant="destructive" key={transactionId}>
                        <AlertTitle>Transaction: {transactionId}</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside space-y-1 mt-2">
                            {failedLogs.map(log => (
                              <li key={log.id} className="text-sm">
                                {log.entityType}: {log.message}
                              </li>
                            ))}
                          </ul>
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
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by transaction number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Transaction Logs</h2>
            {loading ? (
              <p>Loading logs...</p>
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
                          Transaction: {transactionId}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(logs[0].timestamp).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <Tabs defaultValue="payment">
                        <TabsList className="mb-4">
                          <TabsTrigger value="payment">Payment</TabsTrigger>
                          <TabsTrigger value="qoyod">Qoyod</TabsTrigger>
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