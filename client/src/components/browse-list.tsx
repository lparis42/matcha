import { useSocket } from "@/api/Socket"
import PreviewCard from "./preview-card"
import { createContext, useContext, useEffect, useReducer, useState } from "react";
import ItemProfile from "./item-profile";
import { useToast } from "./ui/use-toast";
import { interests_to_int } from "@/app/routes/__auth/profile";

interface FiltersState {
    ageRange: [number, number];
    kmRange: [number];
    fame: [number];
    interests: string[];
  }

interface BrowseListProps {
    filters: FiltersState;
    sortOption: string;
    userId?: number;
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

export const ListContext = createContext(null);

function listReducer(state: any, action: any) {
    switch (action.type) {
      case "REMOVE":
        return state.filter((item: any) => item.id !== action.payload);
      case "SET_PROFILES":
        return action.payload;
      default:
        return state;
    }
  }

export default function BrowseList({ filters, sortOption, userId }: BrowseListProps) {
    const {eventBrowsing, eventView} = useSocket()
    const [error, setError] = useState<Error | null>(null);
    //const [listProfils, setListProfils] = useState<any[] | null>(null);
    const [listProfils, dispatch] = useReducer(listReducer, null);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchProfiles() {
            const [err, profiles] = await eventBrowsing();
            if (err) {
                toast({title: err.client});
                return;
            }

            const profilesWithAge = profiles.map(profile => ({
                ...profile,
                age: calculateAge(profile.date_of_birth)
            }));


            const filteredProfiles = filterProfiles(profilesWithAge, filters);
            const sortedProfiles = sortProfiles(filteredProfiles, sortOption);
            
            // Fetch the user by ID and add to the profiles list
            if (userId) {
              const [userErr, userProfile] = await eventView(userId);
              if (userErr) {
                toast({ title: userErr.client });
              } else {
                sortedProfiles.unshift(userProfile)
              }
            }
            
            dispatch({ type: 'SET_PROFILES', payload: sortedProfiles });
        }

        fetchProfiles();
    }, [filters, sortOption]);

    if (error) return <div>Error: {error.message}</div>
    if (!listProfils) return <div>Loading...</div>
    
    return (
        <ListContext.Provider value={{ dispatch }}>
          {listProfils.map((item: any, index: number) => (
              <ItemProfile key={index} items={item} initialExpanded={item.id === userId}/>
          ))}
        </ListContext.Provider>
    )
}

// Sorting function
function sortProfiles(profiles: any[], sortOption: string): any[] {
    switch (sortOption) {
      case "age":
        return profiles.sort((a, b) => a.age - b.age);
      case "proximity":
        return profiles.sort((a, b) => a.distance - b.distance);
      case "common_tags":
        return profiles.sort((a, b) => b.tags.length - a.tags.length);
      case "fame":
        return profiles.sort((a, b) => b.fame_rating - a.fame_rating);
      default:
        return profiles;
    }
  }

function filterProfiles(profiles: any[], filters: FiltersState): any[] {
  return profiles.filter(profile => {
    const ageMatch = profile.age >= filters.ageRange[0] && profile.age <= filters.ageRange[1];
    const kmMatch = profile.distance <= filters.kmRange[0];
    const fame = profile.fame_rating >= filters.fame[0];
    const filterinterestint = interests_to_int(filters.interests)
    const interestsMatch = filterinterestint.every(interest => profile.common_tags.includes(interest));
    return ageMatch && interestsMatch && kmMatch && fame
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
