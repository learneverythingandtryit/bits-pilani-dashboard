import { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Check, Bug } from 'lucide-react';
import { copyWithFeedback } from '../utils/clipboard';
import { runClipboardDiagnostics } from '../utils/clipboardTest';
import { toast } from 'sonner@2.0.3';

interface ClipboardTestButtonProps {
  className?: string;
}

export function ClipboardTestButton({ className }: ClipboardTestButtonProps) {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleTestCopy = async () => {
    const testText = "This is a test copy operation from BITS Pilani Student Dashboard! 📋✅";
    
    try {
      await copyWithFeedback(
        testText,
        toast,
        "Test copy successful! 🎉",
        setCopied
      );
    } catch (error) {
      console.error('Test copy failed:', error);
      toast.error("Test copy failed. Check console for details.");
    }
  };

  const handleRunDiagnostics = async () => {
    setTesting(true);
    try {
      const results = await runClipboardDiagnostics();
      
      // Show summary toast
      if (results.successfulMethods > 0) {
        toast.success(`Clipboard test complete! ${results.successfulMethods} method(s) working.`);
      } else {
        toast.error("All clipboard methods failed. Check console for details.");
      }
    } catch (error) {
      console.error('Diagnostics failed:', error);
      toast.error("Diagnostics failed. Check console for details.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleTestCopy}
        disabled={copied}
        className="text-xs"
      >
        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
        {copied ? "Copied!" : "Test Copy"}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleRunDiagnostics}
        disabled={testing}
        className="text-xs"
      >
        {testing ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
            Testing...
          </>
        ) : (
          <>
            <Bug className="w-3 h-3 mr-1" />
            Diagnose
          </>
        )}
      </Button>
    </div>
  );
}