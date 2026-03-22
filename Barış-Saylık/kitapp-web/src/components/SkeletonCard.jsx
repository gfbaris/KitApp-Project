// Kitap kartı yüklenirken gösterilecek skeleton bileşeni
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-100"></div>
    <div className="p-4 space-y-2.5">
      <div className="h-3.5 bg-gray-100 rounded-full w-3/4"></div>
      <div className="h-3 bg-gray-100 rounded-full w-1/2"></div>
      <div className="flex justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="h-3 bg-gray-100 rounded-full w-1/4"></div>
        <div className="h-3 bg-gray-100 rounded-full w-1/4"></div>
      </div>
    </div>
  </div>
);

export default SkeletonCard;
