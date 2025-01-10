import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALL_PROMPT_DISMISSED = 'install-prompt-dismissed';

export function InstallPWA() {
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Check if user has dismissed the toast before
      if (localStorage.getItem(INSTALL_PROMPT_DISMISSED)) {
        return;
      }

      // Show toast notification
      const { dismiss } = toast({
        title: "Install NEAR Ecosystem Map",
        description: "Add this app to your home screen for quick access.",
        action: (
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => {
                // This will trigger the native prompt
                e.prompt();
              }}
            >
              Install
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                localStorage.setItem(INSTALL_PROMPT_DISMISSED, 'true');
                dismiss();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ),
        duration: 30000,
        className: "[&>[role=button]]:hidden", // Hide the default close button
        onOpenChange: (open) => {
          // When toast is dismissed (closed), remember it
          if (!open) {
            localStorage.setItem(INSTALL_PROMPT_DISMISSED, 'true');
          }
        },
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, [toast]);

  return null;
} 