import React from 'react';
import { useState, useCallback } from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { cameraImage } from '../assets';
import { useDispatch, useSelector } from 'react-redux';
import { setUploadedImage, setCritique } from '../redux/imageSlice';

const Uploading = () => {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploaded, setUploaded] = useState(false);
    const [fileError, setFileError] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const dispatch = useDispatch();
    const uploadedImage = useSelector(state => state.image.uploadedImage);
    const navigate = useNavigate(); 

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setFileError(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setFileError(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const newFile = e.dataTransfer.files[0];
            if (isValidFileType(newFile.type)) {
                setFile(newFile);
                simulateFileUpload(newFile);
            } else {
                setFileError(true);
            }
        }
    }, []);

    const isValidFileType = (fileType) => {
        return ['image/png', 'image/jpeg'].includes(fileType);
    };

    const simulateFileUpload = (newFile) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setUploaded(true);
                const imageSrc = URL.createObjectURL(newFile);
                dispatch(setUploadedImage(imageSrc));
            }
        }, 100);
    };

    const handleFileChange = (e) => {
        const newFile = e.target.files[0];
        if (isValidFileType(newFile.type)) {
            setFileError(false);
            setFile(newFile);
            simulateFileUpload(newFile);
        } else {
            setFileError(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (uploadedImage) {
            setIsGenerating(true); 
            const formData = new FormData();
            formData.append('file', file); // Assuming `file` is stored in state after being selected

            try {
                const response = await fetch('https://artisight.onrender.com/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                if (response.ok) {
                    console.log(data.critique)
                    dispatch(setCritique(data.critique));
                    navigate('/feedback')
                } else {
                    console.error('Failed to upload image: ', data.error);
                    setIsGenerating(false); 
                }
            } catch (error) {
                console.error('Error making the request:', error);
                setIsGenerating(false); 
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-center m-10">
            <div className='md:flex justify-center items-center md:w-1/2'>
                {uploaded ? (
                    <img src={uploadedImage} alt="Uploaded Image" className='text-center rounded-xl' />
                ) : (
                    <img src={cameraImage} alt="Upload Illustration" className='text-center rounded-xl' />
                )}
            </div>
            <div className="text-left flex flex-col sm:p-8 pt-8 w-full md:w-1/2 lg:w-2/5">
                <h1 className="text-3xl max-sm:text-lg font-bold mb-5 text-primary">Get instant AI critique on your photographs and resources to improve your skills</h1>
                {!uploaded && !fileError ? <h2 className="text-xl font-bold mb-5 text-dark">Drag & Drop or Upload the Photo Below</h2> : null}
                {fileError ? <h2 className="text-xl font-bold mb-5 text-danger">Unsupported file format. Please upload JPEG or PNG images.</h2> : null}
                {uploaded ? <h2 className="text-xl font-bold mb-5 text-success">Uploaded</h2> : null}
                <div className="flex">
                    <form onSubmit={handleSubmit} className="w-full" onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary"
                            accept="image/png, image/jpeg"
                        />
                        <p className='mt-4'>We support common image formats (JPEG, PNG, etc.) <br /> Maximum file size is 10MB.</p>
                        <div className="progress-bar bg-gray-200 rounded-full h-2.5 mt-4">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        {!uploaded ? <p className='mt-4'>{uploadProgress}%</p> : <p className='mt-4 text-success flex gap-2'>{uploadProgress}%<CheckCircle size={24} /></p>}
                        <button type="submit" className={`mt-5 w-full bg-primary text-white rounded-lg px-4 py-2 hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-purple-300 ${isGenerating ? 'loading-animation' : ''}`}>
                            {isGenerating ? 'Generating...':'Get Critique'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Uploading;
