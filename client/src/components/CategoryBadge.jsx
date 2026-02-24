const CATEGORY_COLORS = {
    conference: 'bg-blue-500/20 text-blue-400',
    workshop: 'bg-yellow-500/20 text-yellow-400',
    social: 'bg-green-500/20 text-green-400',
    sports: 'bg-orange-500/20 text-orange-400',
    music: 'bg-purple-500/20 text-purple-400',
    other: 'bg-gray-500/20 text-gray-400',
};

const CategoryBadge = ({ category }) => (
    <span className={`badge capitalize ${CATEGORY_COLORS[category] || CATEGORY_COLORS.other}`}>
        {category}
    </span>
);

export default CategoryBadge;
