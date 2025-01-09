import React, { useEffect, useRef } from 'react';
import { CategorizedProjects, Category } from '@/types/projects';
import * as d3 from 'd3';
import { Theme } from '@/types/theme';

interface SharePreviewProps {
  categories: CategorizedProjects;
  visibleCategories: Record<string, boolean>;
  theme?: Theme;
  showInactive: boolean;
}

const SharePreview = ({ categories, visibleCategories, theme, showInactive }: SharePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleCats = Object.entries(categories)
    .filter(([key]) => visibleCategories[key])
    .map(([key, category]) => {
      // Filter projects based on phase
      const filteredProjects = category.projects.filter(project => 
        showInactive || project.phase !== 'inactive'
      );
      return [key, { ...category, projects: filteredProjects }] as [string, Category];
    })
    .filter(([_, category]) => category.projects.length > 0)
    .sort((a, b) => a[1].title.localeCompare(b[1].title));

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    const container = d3.select(containerRef.current);
    container.selectAll('.category-card').remove();

    const width = 3840;
    const height = 2160;
    const padding = 20;
    const titleHeight = 100;

    // Available space for the grid
    const availableWidth = width - (padding * 2);
    const availableHeight = height - titleHeight - (padding * 2);
    const totalArea = availableWidth * availableHeight;

    // Calculate base size needed for a single project icon
    const minIconSize = 64;
    const iconPadding = 16;
    const baseIconArea = (minIconSize + iconPadding) * (minIconSize + iconPadding + 24);

    // Calculate total projects and category stats
    const totalProjects = visibleCats.reduce((sum, [_, cat]) => sum + cat.projects.length, 0);
    const maxProjects = Math.max(...visibleCats.map(([_, cat]) => cat.projects.length));
    const avgProjects = totalProjects / visibleCats.length;

    // Calculate dynamic maxIconSize based on total number of projects
    const maxIconSize = Math.max(
      96,  // increased minimum max size
      Math.min(
        200,  // increased absolute maximum
        Math.floor(320 / Math.sqrt(totalProjects * 0.05))  // increased base value for scaling
      )
    );

    interface TreemapData {
      key: string;
      category: CategorizedProjects[keyof CategorizedProjects];
      value: number;
    }

    // First pass: calculate initial weights
    const initialWeights = visibleCats.map(([key, category]) => {
      const numProjects = category.projects.length;
      
      // Base area calculation
      const targetColumns = Math.ceil(Math.sqrt(numProjects * 1.2)); // Add 20% for better spacing
      const targetRows = Math.ceil(numProjects / targetColumns);
      const idealArea = targetColumns * targetRows * baseIconArea * 1.3; // Add 30% for padding and text
      
      // Calculate weight based on project count relative to total
      const projectRatio = numProjects / totalProjects;
      const areaRatio = idealArea / totalArea;
      
      // Progressive scaling for larger categories
      const scaleFactor = numProjects > avgProjects 
        ? 1 + Math.log2(numProjects / avgProjects) 
        : Math.sqrt(numProjects / avgProjects);

      return {
        key,
        category,
        numProjects,
        idealArea,
        projectRatio,
        areaRatio,
        scaleFactor
      };
    });

    // Calculate final weights with better distribution
    const weightedData = initialWeights.map(data => {
      // Base weight starts with project ratio
      let weight = data.projectRatio * totalArea;
      
      // Adjust weight based on category size
      if (data.numProjects > avgProjects * 2) {
        // Large categories get more space
        weight *= 1.5 * data.scaleFactor;
      } else if (data.numProjects < avgProjects / 2) {
        // Small categories get less space but maintain usability
        weight *= 0.7;
      }

      // Ensure minimum usable size
      const minSize = Math.max(
        baseIconArea * 4,
        totalArea * 0.02 // Minimum 2% of total area
      );

      // Cap maximum size for very large categories
      const maxSize = Math.min(
        totalArea * 0.25, // Maximum 25% of total area
        baseIconArea * data.numProjects * 1.5
      );

      return {
        key: data.key,
        category: data.category,
        value: Math.min(maxSize, Math.max(minSize, weight))
      };
    });

    // Use D3's treemap layout with adjusted padding
    const treemap = d3.treemap<TreemapData>()
      .size([availableWidth, availableHeight])
      .paddingOuter(16)
      .paddingInner(12)
      .paddingTop(8)
      .round(true);

    const root = d3.hierarchy({ children: weightedData })
      .sum(d => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    treemap(root);

    // Apply calculated dimensions to DOM
    const cards = container.select('.grid-container')
      .selectAll('.category-card')
      .data(root.leaves())
      .join('div')
      .attr('class', 'category-card absolute')
      .style('left', d => `${d.x0 + padding}px`)
      .style('top', d => `${d.y0 + titleHeight + padding}px`)
      .style('width', d => `${d.x1 - d.x0}px`)
      .style('height', d => `${d.y1 - d.y0}px`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cards.each(function(d: any) {
      const card = d3.select(this);
      const cardWidth = d.x1 - d.x0;
      const cardHeight = d.y1 - d.y0;
      const category = d.data.category;
      
      // Calculate optimal icon size based on available space
      const padding = 16;
      const headerHeight = 48;
      const minIconSize = 48;
      // maxIconSize is now defined outside based on total projects
      
      const availableWidth = cardWidth - (padding * 2);
      const availableHeight = cardHeight - headerHeight - (padding * 2);
      
      // Calculate optimal grid layout based on card size and project count
      const numProjects = category.projects.length;
      const aspectRatio = availableWidth / availableHeight;
      
      // Calculate optimal columns based on aspect ratio
      const baseColumns = Math.sqrt(numProjects * aspectRatio);
      const optimalColumns = aspectRatio < 1 
        ? Math.max(2, Math.floor(baseColumns))
        : Math.ceil(baseColumns);
      const optimalRows = Math.ceil(numProjects / optimalColumns);

      // Calculate available space per item including gaps
      const gapSize = 12;
      const textHeight = 32;
      
      // Calculate total space used by gaps
      const totalGapWidth = gapSize * (optimalColumns - 1);
      const totalGapHeight = gapSize * (optimalRows - 1);
      const textTotalHeight = textHeight * optimalRows;
      
      // Calculate base icon size
      const baseIconSize = Math.min(
        (availableWidth - totalGapWidth) / optimalColumns,
        (availableHeight - textTotalHeight - totalGapHeight) / optimalRows
      );

      // Calculate how much empty space would be left with base size
      const gridWidth = (baseIconSize * optimalColumns) + totalGapWidth;
      const gridHeight = (baseIconSize * optimalRows) + totalGapHeight + textTotalHeight;
      const emptyWidth = availableWidth - gridWidth;
      const emptyHeight = availableHeight - gridHeight;
      
      // Calculate scale factor based on empty space ratio
      const emptySpaceRatio = Math.min(
        emptyWidth / availableWidth,
        emptyHeight / availableHeight
      );
      
      // Scale up more if there's lots of empty space, but maintain maximum bounds
      const scaleFactor = Math.min(1.3, 1 + (emptySpaceRatio * 0.5));
      
      // Clamp icon size with scale factor
      const finalIconSize = Math.max(
        minIconSize, 
        Math.min(maxIconSize, Math.floor(baseIconSize * scaleFactor))
      );

      // Dynamic font size calculation based on available space and icon size
      const fontSize = Math.max(10, Math.min(13, Math.floor(finalIconSize / 4.5)));
      
      const sanitizeName = (name: string) => {
        const parts = name.split(/[^\w\s$]+/);
        return parts[0].trim();
      };

      card.html(`
        <div class="h-full rounded-xl p-4 flex flex-col" style="background-color: ${theme.cardBackground}; border: 1px solid ${theme.cardBorder}">
          <h2 class="text-2xl font-bold mb-2" style="color: ${theme.categoryText}">
            ${category.title}
          </h2>
          <div class="flex-1">
            <div class="grid w-full h-full" style="
              grid-template-columns: repeat(${optimalColumns}, 1fr);
              gap: ${gapSize}px;
              align-items: start;
            ">
              ${category.projects.slice(0, optimalColumns * optimalRows).map(project => `
                <div class="flex flex-col items-center gap-2">
                  <div class="rounded-full bg-gray-800 overflow-hidden flex items-center justify-center"
                       style="width: ${finalIconSize}px; height: ${finalIconSize}px">
                    <img
                      src="${project.image || '/placeholder.svg'}"
                      alt="${sanitizeName(project.name)}"
                      class="w-full h-full object-cover"
                      onerror="this.src='/placeholder.svg'"
                    />
                  </div>
                  <span class="text-center w-full px-1 whitespace-normal" 
                        style="color: ${theme.projectText}; font-size: ${fontSize}px; max-width: ${finalIconSize + 24}px; line-height: 1.2;">
                    ${sanitizeName(project.name)}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `);
    });
  }, [visibleCats, theme]);

  return (
    <div 
      className="w-[1920px] h-[1080px] text-left relative overflow-visible" 
      ref={containerRef}
      data-preview="true"
      style={{ backgroundColor: theme.background }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: theme.background }}>
        <div className="h-[7.5rem] flex items-center px-[3.25rem]">
          <img src="/icon.webp" alt="NEAR Protocol" className="w-[4rem] h-[4rem] rounded-lg mr-[1.5rem]" />
          <h1 className="text-[3.75rem] font-bold" style={{ color: theme.titleText }}>
            NEAR Protocol Ecosystem Map - nearprotocol.eco
          </h1>
        </div>
        
        <div className="grid-container absolute inset-0 pt-[8.75rem] overflow-visible" >
          {/* D3 will inject content here */}
        </div>
      </div>
    </div>
  );
};

export default SharePreview;