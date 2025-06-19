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
                suggestions: suggestions,
                maxResults: 2 // Default to 2 results per query as per API
            };
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/resources`,
                data,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000 // 15 second timeout
                }
            );

            // Updated to match new API response structure
            const { webResults, searchQueries, searchSummary } = response.data;
            if (!webResults || !Array.isArray(webResults)) {
                throw new Error('Invalid response format from server');
            }

            // Update resources with the new structure
            setResources(webResults.map(result => ({
                title: result.title,
                link: result.link,
                snippet: result.snippet,
                thumbnail: result.thumbnail || null,
                displayLink: result.displayLink,
                formattedUrl: result.formattedUrl,
                searchQuery: result.searchQuery
            })));
        } catch (error) {
            const errorMessage = error.response?.data?.error ||
                error.message ||
                'Failed to fetch resources. Please try again.';
            setError(errorMessage);
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
