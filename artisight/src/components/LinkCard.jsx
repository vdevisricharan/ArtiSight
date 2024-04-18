import React from 'react';

const LinkCard = ({ title, thumbnail, link }) => {
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <img className="w-full" src={thumbnail} alt={title} />
            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{title}</div>
                <a href={link} target='_blank'className="text-blue-500 hover:text-blue-700 transition-colors duration-300 ease-in-out">
                    Visit Link
                </a>
            </div>
        </div>
    );
};

export default LinkCard;
