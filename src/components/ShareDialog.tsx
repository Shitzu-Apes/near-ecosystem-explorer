import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas-pro';
import { CategorizedProjects } from '@/types/projects';
import ShareDialogControls from './ShareDialogControls';
import SharePreviewContainer from './SharePreviewContainer';
import { THEMES } from '@/types/theme';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategorizedProjects;
  visibleCategories: Record<string, boolean>;
  showInactive: boolean;
}

const ShareDialog = ({ open, onOpenChange, categories, visibleCategories, showInactive }: ShareDialogProps) => {
  const { toast } = useToast();
  const [zoom, setZoom] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateZoom = () => {
      if (!containerRef.current || !previewRef.current) return;
      
      const container = containerRef.current;
      const preview = previewRef.current;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const previewWidth = 1920;
      const previewHeight = 1080;
      
      const horizontalScale = containerWidth / previewWidth;
      const verticalScale = containerHeight / previewHeight;
      
      const initialZoom = Math.min(horizontalScale, verticalScale) * 0.95;
      setZoom(initialZoom);
    };

    if (open) {
      // Initial calculation with a small delay to ensure container is ready
      const timer = setTimeout(calculateZoom, 100);
      
      // Handle window resize
      window.addEventListener('resize', calculateZoom);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calculateZoom);
      };
    }
  }, [open]);

  const capturePreview = async () => {
    if (!previewRef.current) return null;
    
    try {
      const originalTransform = previewRef.current.style.transform;
      previewRef.current.style.transform = 'scale(1)';
      
      const canvas = await html2canvas(previewRef.current, {
        width: 3840,
        height: 2160,
        scale: 1,
        backgroundColor: '#0A0F1C',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      previewRef.current.style.transform = originalTransform;
      return canvas;
    } catch (error) {
      console.error('Failed to capture preview:', error);
      return null;
    }
  };

  const handleCopy = async () => {
    const pendingToast = toast({
      title: "Copying...",
      description: "Preparing image for clipboard",
    });

    try {
      window.focus();
      
      const canvas = await capturePreview();
      if (!canvas) throw new Error('Failed to capture preview');

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else throw new Error('Failed to create blob');
        }, 'image/png');
      });

      const data = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([data]);

      toast({
        id: pendingToast.id,
        title: "Copied!",
        description: "Image copied to clipboard",
      });
    } catch (error) {
      console.error('Copy failed:', error);
      
      // Check if it's a permission error
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          id: pendingToast.id,
          title: "Permission Denied",
          description: "Please allow clipboard access in your browser settings to copy images.",
          variant: "destructive",
        });
      } else {
        toast({
          id: pendingToast.id,
          title: "Error",
          description: "Failed to copy image. Try downloading instead.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownload = async () => {
    try {
      const canvas = await capturePreview();
      if (!canvas) throw new Error('Failed to capture preview');

      const link = document.createElement('a');
      link.download = 'near-ecosystem-map.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Downloaded!",
        description: "Image has been downloaded",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTwitterShare = () => {
    const text = "Check out this NEAR Protocol Ecosystem Map! 🚀";
    const url = window.location.href;
    const hashtags = "NEAR,Web3,Blockchain";
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;
    window.open(twitterUrl, '_blank');
    
    toast({
      title: "Opening Twitter",
      description: "Redirecting you to share on Twitter/X",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Share Preview</DialogTitle>
          <DialogDescription>
            Create and share an image of your NEAR ecosystem map
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          <SharePreviewContainer
            containerRef={containerRef}
            previewRef={previewRef}
            zoom={zoom}
            categories={categories}
            visibleCategories={visibleCategories}
            theme={selectedTheme}
            showInactive={showInactive}
          />
          
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium">Theme:</label>
            <select 
              className="bg-background border rounded px-2 py-1"
              value={selectedTheme.name}
              onChange={(e) => setSelectedTheme(THEMES.find(t => t.name === e.target.value) || THEMES[0])}
            >
              {THEMES.map(theme => (
                <option key={theme.name} value={theme.name}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
          
          <ShareDialogControls
            zoom={zoom}
            onZoomIn={() => setZoom(prev => Math.min(prev + 0.1, 2))}
            onZoomOut={() => setZoom(prev => Math.max(prev - 0.1, 0.1))}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onTwitterShare={handleTwitterShare}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;