const AnnouncementBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-10 bg-white text-black flex items-center justify-center px-4 animate-fade-in">
      <p className="flex items-center gap-2 text-center text-[11px] sm:text-sm font-bold tracking-wide sm:tracking-wider uppercase whitespace-nowrap overflow-hidden text-ellipsis">
        <span className="text-red-600">7 Days Promotion</span>
        <span className="hidden sm:inline text-gray-400">/</span>
        <span className="sm:hidden text-gray-400">-</span>
        <span>50% Off TAOS Volume 5</span>
      </p>
    </div>
  );
};

export default AnnouncementBar;
