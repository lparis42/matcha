import { useSocket } from "@/api/Socket"
import PreviewCard from "./preview-card"
import { useEffect, useState } from "react";


const DATA = [
    {
        "id": 0,
        "username": "hxkvdy",
        "first_name": "User",
        "last_name": "hxkvdy",
        "date_of_birth": "1990-01-01",
        "gender": "Male",
        "sexual_orientation": "Heterosexual",
        "biography": "This is a test biography for hxkvdy.",
        "common_tags": ['Technology', 'Health', 'Business', 'Entertainment'],
        "pictures": ["1_1725024336803_0.WebP"],
        "fame_rating": 1,
        "geolocation": [40.7128, -74.0060],
        "location": "New York, USA",
        "online": false,
        "last_connection": "2024-09-07T17:45:36.622Z"
    },
    {
        "id": 0,
        "username": "abc123",
        "first_name": "User",
        "last_name": "abc123",
        "date_of_birth": "1985-05-15",
        "gender": "Female",
        "sexual_orientation": "Homosexual",
        "biography": "This is a test biography for abc123.",
        "common_tags": ['Technology', 'Health', 'Business'],
        "pictures": ["1_1725024336803_0.WebP"],
        "fame_rating": 1,
        "geolocation": [34.0522, -118.2437],
        "location": "Los Angeles, USA",
        "online": false,
        "last_connection": "2024-09-07T17:45:36.622Z"
    },
    {
        "id": 0,
        "username": "def456",
        "first_name": "User",
        "last_name": "def456",
        "date_of_birth": "1992-07-20",
        "gender": "Non-binary",
        "sexual_orientation": "Bisexual",
        "biography": "This is a test biography for def456.",
        "common_tags": ['Business', 'Entertainment', 'Travel'],
        "pictures": ["1_1725024336803_0.WebP"],
        "fame_rating": 1,
        "geolocation": [51.5074, -0.1278],
        "location": "London, UK",
        "online": false,
        "last_connection": "2024-09-07T17:45:36.622Z"
    },
    {
        "id": 0,
        "username": "ghi789",
        "first_name": "User",
        "last_name": "ghi789",
        "date_of_birth": "1988-11-30",
        "gender": "Male",
        "sexual_orientation": "Asexual",
        "biography": "This is a test biography for ghi789.",
        "common_tags": ['Technology', 'Health', 'Travel'],
        "pictures": ["1_1725024336803_0.WebP"],
        "fame_rating": 1,
        "geolocation": [48.8566, 2.3522],
        "location": "Paris, France",
        "online": false,
        "last_connection": "2024-09-07T17:45:36.622Z"
    },
    {
        "id": 0,
        "username": "jkl012",
        "first_name": "User",
        "last_name": "jkl012",
        "date_of_birth": "1995-03-25",
        "gender": "Female",
        "sexual_orientation": "Pansexual",
        "biography": "This is a test biography for jkl012.",
        "common_tags": ['Religion', 'Law'],
        "pictures": ["1_1725024336803_0.WebP"],
        "fame_rating": 1,
        "geolocation": [35.6895, 139.6917],
        "location": "Tokyo, Japan",
        "online": false,
        "last_connection": "2024-09-07T17:45:36.622Z"
    }
]

interface FiltersState {
    ageRange: [number, number];
    kmRange: [number];
    interests: string[];
  }

interface BrowseListProps {
    filters: FiltersState;
    sortOption: string;
  }

interface Profile {
    gender: string;
    sexual_orientation: string;
    first_name: string;
    last_name: string;
    email: string;
    birth_date: Date;
    biography: string;
    interests: string[];
    pictures: string[];
    location: string;
    fame_rating: number;
}

export default function BrowseList({ filters, sortOption }: BrowseListProps) {
    const {eventBrowsing, eventView} = useSocket()
    const [error, setError] = useState<Error | null>(null);
    const [listProfils, setListProfils] = useState<any[] | null>(null);

    useEffect(() => {
        async function fetchProfiles() {
            // const [err, profiles] = await eventBrowsing();
            //setError(err);
            //const data = [];
            //[0, 1, 2, 3, 4].forEach((index) => {
            //    eventView(index, (err, profile) => {
            //        if (err) {
            //            console.log(err);
            //        } else {
            //            setItems(profile);
            //        }
            //    });
            //});
            // Calculate age for each profile
            const profilesWithAge = DATA.map(profile => ({
                ...profile,
                age: calculateAge(profile.date_of_birth)
            }));
            const filteredProfiles = filterProfiles(profilesWithAge, filters);
            const sortedProfiles = sortProfiles(filteredProfiles, sortOption);
            setListProfils(sortedProfiles);
        }

        fetchProfiles();
    }, [filters, sortOption]);
    
    if (error) return <div>Error: {error.message}</div>
    if (!listProfils) return <div>Loading...</div>
    
    return (
        <>
        {listProfils.map((item: any, index: number) => (
            <PreviewCard key={index} items={item} />
        ))}
        </>
    )
}

// Sorting function
function sortProfiles(profiles: any[], sortOption: string): any[] {
    switch (sortOption) {
      case "age":
        return profiles.sort((a, b) => a.age - b.age);
    //  case "proximity":
    //    return profiles.sort((a, b) => a.distance - b.distance);
      case "common_tags":
        return profiles.sort((a, b) => b.tags.length - a.tags.length);
      default:
        return profiles;
    }
  }

function filterProfiles(profiles: any[], filters: FiltersState): any[] {
  return profiles.filter(profile => {
    const ageMatch = profile.age >= filters.ageRange[0] && profile.age <= filters.ageRange[1];
    //const kmMatch = profile.distance <= filters.kmRange[0];
    const interestsMatch = filters.interests.every(interest => profile.common_tags.includes(interest));
    return ageMatch && interestsMatch //&& kmMatch
  });
}

// Function to calculate age
function calculateAge(birthdate: string): number {
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
