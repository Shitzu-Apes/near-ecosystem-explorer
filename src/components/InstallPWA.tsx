import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

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
      toast({
        title: "Install NEAR Ecosystem Map",
        description: "Add this app to your home screen for quick access.",
        action: (
          <Button
            variant="default"
            onClick={() => {
              // This will trigger the native prompt
              e.prompt();
            }}
          >
            Install
          </Button>
        ),
        duration: 30000,
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