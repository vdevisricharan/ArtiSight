import React, { useState, useEffect } from 'react';
import LinkCard from './LinkCard';
import axios from 'axios';

const Resources = ({ critique, suggestions }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setFetching(true);
        setLoading(true);
        setError('');
        try {
            const data = {
                critique: critique,
                suggestions: suggestions
            };
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/resources`,
                data
            );
            setResources(response.data.webResults);
        } catch (error) {
            setError('Failed to fetch resources. Please try again.');
        } finally {
            setLoading(false);
            setFetching(false);
        }
    };
    useEffect(() => {
        if (fetching || resources.length > 0) return;
        fetchData();
    }, [fetching, resources.length]);  

    // Fallback for missing data
    if (!critique || !suggestions) {
        return (
            <div className="p-8 lg:px-20">
                <div className='px-5 lg:px-10'>
                    <h2 className="text-3xl font-bold mb-4 text-dark">Resources</h2>
                    <div className="text-dark font-medium text-xl">No critique or suggestions available to fetch resources.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 lg:px-20">
            <div className='px-5 lg:px-10'>
                <h2 className="text-3xl font-bold mb-4 text-dark">Resources</h2>
                {loading ? (
                    <div className="flex items-start">
                        <span className="loader mr-2" aria-label="Loading"></span>
                        <p className='text-dark'>Loading Resources...</p>
                    </div>
                ) : error ? (
                    <div className="text-danger font-medium text-xl" role="alert">{error}</div>
                ) : resources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" role="list">
                        {resources.map((resource, index) => (
                            <LinkCard
                                key={index}
                                title={resource.title}
                                thumbnail={resource.thumbnail}
                                link={resource.link}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-dark font-medium text-xl">Sorry, Bob is busy helping other photographers. Try after some time 😉</div>
                )}
            </div>
        </div>
    );
};

export default Resources;
