
import React from "react";

const teamMembers = [
  {
    id: 1,
    name: "Jisfaaz",
    role: "Founder & Creative Director",
    bio: "With 10+ years in fashion design, Jisfaaz founded ThreadVibe to merge premium quality with sustainable practices.",
    image: "https://i.postimg.cc/wTvhf43H/Screenshot-2025-05-16-014402.png",
  },
  {
    id: 2,
    name: "Shazan",
    role: "Head of Production",
    bio: "Shazan ensures our manufacturing processes meet the highest ethical and environmental standards.",
    image: "https://i.postimg.cc/NMdKRY6X/Screenshot-2025-05-16-014517.png",
  },
  {
    id: 3,
    name: "Samhan",
    role: "Lead Designer",
    bio: "Samhan brings ThreadVibe designs to life with a perfect blend of current trends and timeless style.",
    image: "https://i.postimg.cc/C15hT88Z/Screenshot-2025-05-17-001047.png",
  },
  {
    id: 4,
    name: "Hussain",
    role: "Sustainability Officer",
    bio: "Hussain works to continuously improve our eco-friendly practices across all aspects of the business.",
    image: "https://i.postimg.cc/tCKY3BxB/Screenshot-2025-05-16-014623.png",
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
