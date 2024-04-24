import React from 'react';

const LinkCard = ({ title, thumbnail, link }) => {
    return (
        <div className="w-full h-96 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out border">
            <div className="w-full h-2/3 overflow-hidden">
                <img className="w-full h-full object-cover" src={thumbnail} alt={title} />
            </div>
            <div className="px-6 py-4 h-1/3 flex flex-col justify-between">
                <div className="font-bold text-xl mb-2 line-clamp-2">{title}</div>
                <a href={link} target='_blank' rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors duration-300 ease-in-out">
                    Visit Link
                </a>
            </div>
        </div>
    );
};
export default LinkCard;
