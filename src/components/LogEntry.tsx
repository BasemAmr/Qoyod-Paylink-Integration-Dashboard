// LogEntry.txt
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Log {
  entityType: string;
  entityName: string;
  status: string;
  message: string;
  timestamp: string;
  qoyodInvoiceId?: string;
}

interface LogEntryProps {
  log: Log;
}

export function LogEntry({ log }: LogEntryProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'created':
      case 'synced':
        return 'bg-green-100 text-green-800';
      case 'syncfailed':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{log.entityName}</span>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                getStatusColor(log.status)
              )}
            >
              {log.status}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(log.timestamp).toLocaleString('ar-SA')}{' '}
          </span>
        </div>
        {/* Ensure text wraps correctly */}
        <p className="text-gray-600 text-right break-words" dir="rtl">
          {log.message}
        </p>
        {log.qoyodInvoiceId && (
          <p
            className="text-sm text-gray-500 text-right break-words"
            dir="rtl"
          >
            {`معرف فاتورة قيود: ${log.qoyodInvoiceId}`}
          </p>
        )}
      </div>
    </Card>
  );
}