import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@remix-run/react';
import { Project } from '@/types/projects';
import { sortProjectsByScoreAndPhase } from '@/utils/sorting';
import { sanitizeName } from '@/lib/utils';

interface CategoryCardProps {
  title: string;
  color: string;
  projects: Project[];
  onClick: () => void;
  isPriority?: boolean;
  slug: string;
  showInactive: boolean;
}

const CategoryCard = ({ title, color, projects, onClick, isPriority = false, slug, showInactive }: CategoryCardProps) => {
  // Filter and sort projects
  const filteredAndSortedProjects = sortProjectsByScoreAndPhase(
    projects.filter(project => showInactive || project.phase !== 'inactive')
  );
  
  return (
    <div className="relative">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ 
          duration: 0.3,
          layout: {
            duration: 0.3,
            ease: "easeInOut"
          }
        }}
        className={`${color} rounded-lg p-4 cursor-pointer flex flex-col w-full min-h-[200px] ${
          isPriority ? 'ring-2 ring-white/20 shadow-lg' : ''
        }`}
        whileHover={{ y: -5 }}
        onClick={onClick}
      >
        <motion.h2 
          layout="position" 
          className={`text-xl font-bold mb-3 ${isPriority ? 'flex items-center gap-2' : ''}`}
        >
          {isPriority && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-white/10">
              Featured
            </span>
          )}
          {title}
        </motion.h2>
        <motion.div 
          layout="position" 
          className="grid grid-cols-2 sm:grid-cols-3 gap-2 auto-rows-min flex-grow"
        >
          {filteredAndSortedProjects.slice(0, 9).map((project) => (
            <div 
              key={project.name} 
              className="flex flex-col items-center justify-start gap-1"
            >
              <div className="w-10 h-10 relative">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full rounded-full object-cover bg-white p-1"
                />
              </div>
              <span className="text-xs text-center w-full px-1 break-words [word-break:break-word]">
                {sanitizeName(project.name)}
              </span>
            </div>
          ))}
          {filteredAndSortedProjects.length > 9 && (
            <motion.div 
              layout
              className="flex items-center justify-center text-xs text-white/70"
            >
              +{filteredAndSortedProjects.length - 9} more
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      <Link 
        to={`/category/${slug}`}
        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 rounded-lg transition-opacity"
      >
        <span className="text-white font-medium">View Details →</span>
      </Link>
    </div>
  );
};

export default CategoryCard;