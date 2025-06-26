import { useState } from 'react';

const UserCourses = () => {
  const [courses] = useState([
    {
      id: 1,
      name: 'Inteligencia Artificial aplicada a la educación',
      duration: '8 Semanas',
      progress: 65,
    }
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {course.name}
              </h3>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#8BAE52] bg-[#8BAE52]/10">
                En progreso
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Duración: {course.duration}
            </p>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-end">
                <span className="text-xs font-semibold inline-block text-[#8BAE52]">
                  {course.progress}%
                </span>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#8BAE52]/10">
                <div 
                  style={{ width: `${course.progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#8BAE52]"
                ></div>
              </div>
            </div>
            <button className="w-full bg-[#1A3D33] text-white py-2 px-4 rounded hover:bg-[#152f27] transition-colors">
              Continuar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserCourses;
