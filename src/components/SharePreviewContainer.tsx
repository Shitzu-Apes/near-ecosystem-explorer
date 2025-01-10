import React from 'react';
import SharePreview from './SharePreview';
import { CategorizedProjects } from '@/types/projects';
import { Theme } from '@/types/theme';

interface SharePreviewContainerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  previewRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  categories: CategorizedProjects;
  visibleCategories: Record<string, boolean>;
  theme: Theme;
  showInactive: boolean;
  showOnlyTokens: boolean;
}

const SharePreviewContainer = ({
  containerRef,
  previewRef,
  zoom,
  categories,
  visibleCategories,
  theme,
  showInactive,
  showOnlyTokens,
}: SharePreviewContainerProps) => {
  return (
    <div 
      ref={containerRef}
      className="flex-1 min-h-0 overflow-auto bg-gray-900 rounded-lg flex items-start justify-start"
    >
      <div 
        className="relative flex-shrink-0"
        style={{ 
          width: 1920 * zoom,
          height: 1080 * zoom,
          transition: 'width 0.2s ease-out, height 0.2s ease-out'
        }}
      >
        <div 
          className="origin-top-left absolute top-0 left-0 w-[1920px] h-[1080px]"
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
          ref={previewRef}
        >
          <SharePreview
            categories={categories}
            visibleCategories={visibleCategories}
            theme={theme}
            showInactive={showInactive}
            showOnlyTokens={showOnlyTokens}
          />
        </div>
      </div>
    </div>
  );
};

export default SharePreviewContainer;