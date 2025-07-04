import React from "react";
import { GraphNode } from "../utils/graphUtils";

interface ProfileCardProps {
  node: GraphNode | null;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ node }) => {
  if (!node) return null;
  // Dummy data for missing fields
  const location = "29, Spain";
  const about =
    "Experienced and compassionate doctor specializing in cardiology.";
  const patientServed = 1000;
  const patientServedChange = "+20";
  const successRate = "95%";
  const successRateChange = "+5%";
  const education = node.education || [
    {
      school: "Harvard medical University",
      degree: "Cardiology Degree",
      field: "Specialization in Heart Health",
      period: "Sep2015-Jun 2020",
    },
  ];
  const work = node.work || [];
  const publications = node.publications || [];

  return (
    <div className="w-full max-w-xs bg-white rounded-2xl shadow-lg p-4 mx-auto">
      {/* Map and avatar row */}
      <div className="relative flex flex-col items-center">
        <div className="w-full h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-[-36px]">
          {/* Dummy map background */}
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&q=80"
            alt="Map"
            className="w-full h-16 object-cover rounded-xl"
          />
        </div>
        <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt={node.name || node.label || "Profile"}
          className="w-20 h-20 rounded-full border-4 border-blue-200 shadow object-cover mt-[-36px] bg-white"
          style={{ zIndex: 2 }}
        />
      </div>
      {/* Name, badges, about */}
      <div className="flex flex-col items-center mt-1">
        <div className="text-lg font-extrabold text-blue-900 text-center mb-1 truncate" style={{ maxWidth: "160px" }}>
          {node.name || node.label || "Dr. Emily Carter"}
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-1">
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{node.type || "Cardiologist"}</span>
          <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">{location}</span>
        </div>
        <div className="text-gray-500 text-xs text-center mb-1">{about}</div>
        <div className="flex gap-4 justify-center mb-2">
          <div className="text-center">
            <div className="text-[10px] text-gray-400">Peers</div>
            <div className="font-bold text-blue-900 text-base">232</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-400">Following</div>
            <div className="font-bold text-blue-900 text-base">124</div>
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-full shadow transition text-sm min-w-[90px]">View Profile</button>
          <button className="bg-gray-100 text-gray-700 font-semibold px-4 py-1.5 rounded-full shadow transition text-sm min-w-[90px]">Resume</button>
          <button className="bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 rounded-full shadow transition text-sm min-w-[36px]">...</button>
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 my-2">
        <div className="border border-gray-200 rounded-lg p-2 flex flex-col items-center bg-white">
          <div className="text-gray-400 text-[10px] mb-0.5 flex items-center gap-1">
            <span className="material-icons text-sm align-middle">favorite</span> Patient Served
          </div>
          <div className="text-lg font-bold text-blue-900">{patientServed}</div>
          <div className="text-green-500 text-xs font-semibold">{patientServedChange}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-2 flex flex-col items-center bg-white">
          <div className="text-gray-400 text-[10px] mb-0.5 flex items-center gap-1">
             Success rate
          </div>
          <div className="text-lg font-bold text-blue-900">{successRate}</div>
          <div className="text-green-500 text-xs font-semibold">{successRateChange}</div>
        </div>
      </div>
      {/* About section */}
      <div className="mb-2">
        <div className="font-bold text-gray-800 mb-1 text-base">About</div>
        <div className="text-gray-500 text-xs">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam lectus risus,<br />
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam lectus risus, finibus ornare vestibulum et, feugiat quis dui. Vivamus sit amet dolor
        </div>
      </div>
      {/* Education section */}
      <div className="mb-1">
        <div className="font-bold text-gray-800 mb-1 text-base">Education</div>
        {education.length > 0 ? education.map((edu: any, i: number) => (
          <div key={i} className="bg-blue-50 rounded-lg p-2 mb-1 flex flex-col">
            <div className="font-bold text-blue-800 text-sm flex items-center gap-2">
              <span className="inline-block w-6 h-6 bg-blue-200 rounded mr-2" />
              {edu.school || edu.degree}
            </div>
            <div className="text-xs text-gray-500">{edu.degree || edu.field}</div>
            <div className="text-xs text-gray-400">{edu.period || "Sep2015-Jun 2020"}</div>
          </div>
        )) : <div className="text-xs text-gray-400 italic">No education data</div>}
      </div>
    </div>
  );
}; 