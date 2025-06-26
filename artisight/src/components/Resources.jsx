import LinkCard from './LinkCard';
import { useSelector } from 'react-redux';
import { selectResources } from '../redux/imageSlice';

const Resources = () => {
    const cachedResources = useSelector(selectResources);
    const critique = useSelector((state) => state.image.critique);
    const suggestions = useSelector((state) => state.image.suggestions);

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

    const resources = (cachedResources &&
        cachedResources.critique === critique &&
        cachedResources.suggestions === suggestions)
        ? cachedResources.webResults
        : [];

    return (
        <div className="p-8 lg:px-20">
            <div className='px-5 lg:px-10'>
                <h2 className="text-3xl font-bold mb-4 text-dark">Resources</h2>
                {resources.length > 0 ? (
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
