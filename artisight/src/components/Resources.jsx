import React, { useState, useEffect } from 'react';
import LinkCard from './LinkCard';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Resources = () => {
    const critique = useSelector(state => state.image.critique);
    const suggestions = useSelector(state => state.image.suggestions);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    // console.log(critique);
    // console.log(suggestions);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Start loading
            try {
                const response = await axios.post('https://artisight.onrender.com/resources', { critique, suggestions });
                setResources(response.data.webResults);
                console.log(resources);
                setLoading(false); // Stop loading after data is fetched
            } catch (error) {
                console.error('Error fetching resources:', error);
                setLoading(false); // Stop loading if there's an error
            }
        };

        if (critique && suggestions) {
            fetchData();
        }
    }, [critique, suggestions]);

    return (
        <div className="p-8 lg:p-20">
            <div className='px-5 lg:px-10'>
                <h2 className="text-3xl font-bold mb-4 text-dark">Resources</h2>
                {loading ?
                    <div className="flex justify-center items-start">
                        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                        </div>
                    </div> :
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {resources.map((resource, index) => (
                            <LinkCard
                                key={index}
                                title={resource.title}
                                thumbnail={resource.thumbnail}
                                link={resource.link}
                            />
                        ))}
                    </div>}
            </div>
        </div>
    );
};

export default Resources;
