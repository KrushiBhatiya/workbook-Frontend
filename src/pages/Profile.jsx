import { useState, useEffect } from 'react';
import api from '../utils/api';

const Profile = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/students/me');
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    if (!profile) return <div>Loading Profile...</div>;

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">My Profile</h1>

            <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-600">Name:</span>
                    <span className="text-gray-900">{profile.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-600">Email:</span>
                    <span className="text-gray-900">{profile.email}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-600">Contact:</span>
                    <span className="text-gray-900">{profile.contact}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-600">Batch Time:</span>
                    <span className="text-gray-900">{profile.batchTime}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-600">Course:</span>
                    <span className="text-gray-900">{profile.courseId?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-600">Faculty Name:</span>
                    <span className="text-gray-900">{profile.facultyId?.name || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default Profile;
