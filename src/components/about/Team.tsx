
import React from "react";

const teamMembers = [
  {
    id: 1,
    name: "Alex Chen",
    role: "Founder & Creative Director",
    bio: "With 10+ years in fashion design, Alex founded ThreadVibe to merge premium quality with sustainable practices.",
    image: "https://i.pravatar.cc/300?img=11",
  },
  {
    id: 2,
    name: "Jordan Taylor",
    role: "Head of Production",
    bio: "Jordan ensures our manufacturing processes meet the highest ethical and environmental standards.",
    image: "https://i.pravatar.cc/300?img=12",
  },
  {
    id: 3,
    name: "Morgan Lee",
    role: "Lead Designer",
    bio: "Morgan brings ThreadVibe designs to life with a perfect blend of current trends and timeless style.",
    image: "https://i.pravatar.cc/300?img=13",
  },
  {
    id: 4,
    name: "Riley Johnson",
    role: "Sustainability Officer",
    bio: "Riley works to continuously improve our eco-friendly practices across all aspects of the business.",
    image: "https://i.pravatar.cc/300?img=14",
  },
];

const Team = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Meet Our Team</h2>
          <p className="text-gray-600 mt-2">
            The passionate individuals behind ThreadVibe
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover object-center"
              />
              <div className="p-6">
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-brand-purple mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
