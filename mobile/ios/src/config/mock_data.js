// mobile/src/config/mock_data.js
export const MOCK_DATA = {
  users: [
    {
      id: 1,
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      avatar: "https://picsum.photos/100/100?random=person1",
      totalVideos: 12,
      totalViews: 1234,
      followers: 456,
      following: 123,
      isFollowing: false,
      videoCount: 12,
      bio: "Video creator and storyteller"
    },
    {
      id: 2,
      name: "Jane Smith",
      username: "janesmith",
      email: "jane@example.com",
      avatar: "https://picsum.photos/100/100?random=person2",
      totalVideos: 8,
      totalViews: 892,
      followers: 234,
      following: 89,
      isFollowing: true,
      videoCount: 8,
      bio: "Travel vlogger"
    },
    {
      id: 3,
      name: "Mike Johnson",
      username: "mikej",
      email: "mike@example.com",
      avatar: "https://picsum.photos/100/100?random=person3",
      totalVideos: 15,
      totalViews: 2156,
      followers: 678,
      following: 234,
      isFollowing: false,
      videoCount: 15,
      bio: "Tech reviewer and educator"
    }
  ],
  
  videos: [
    {
      id: 1,
      title: "Summer Vacation 2023",
      description: "Amazing trip to the mountains",
      thumbnail: "https://picsum.photos/300/200?random=1",
      duration: "2:34",
      uploadDate: "2023-06-15T10:30:00Z",
      status: "processed",
      views: 127,
      likes: 23,
      userId: 1,
      tags: ["travel", "nature", "adventure"],
      fileSize: "45.2 MB",
      resolution: "1920x1080"
    },
    {
      id: 2,
      title: "Birthday Party Highlights",
      description: "Best moments from Sarah's birthday",
      thumbnail: "https://picsum.photos/300/200?random=2",
      duration: "1:45",
      uploadDate: "2023-06-10T14:20:00Z",
      status: "processing",
      views: 89,
      likes: 15,
      userId: 1,
      tags: ["family", "celebration"],
      fileSize: "32.8 MB",
      resolution: "1920x1080"
    },
    {
      id: 3,
      title: "Weekend Adventure",
      description: "Hiking and exploring new trails",
      thumbnail: "https://picsum.photos/300/200?random=3",
      duration: "3:22",
      uploadDate: "2023-06-08T09:15:00Z",
      status: "processed",
      views: 203,
      likes: 41,
      userId: 2,
      tags: ["hiking", "nature", "fitness"],
      fileSize: "78.5 MB",
      resolution: "1920x1080"
    },
    {
      id: 4,
      title: "Family Dinner",
      description: "Sunday dinner with the whole family",
      thumbnail: "https://picsum.photos/300/200?random=4",
      duration: "1:12",
      uploadDate: "2023-06-05T18:45:00Z",
      status: "processed",
      views: 45,
      likes: 8,
      userId: 1,
      tags: ["family", "food"],
      fileSize: "25.3 MB",
      resolution: "1280x720"
    },
    {
      id: 5,
      title: "Tech Review: New Camera",
      description: "Unboxing and testing the latest camera",
      thumbnail: "https://picsum.photos/300/200?random=5",
      duration: "5:18",
      uploadDate: "2023-06-03T16:30:00Z",
      status: "processed",
      views: 567,
      likes: 89,
      userId: 3,
      tags: ["tech", "review", "camera"],
      fileSize: "124.7 MB",
      resolution: "4K"
    }
  ],
  
  searchSuggestions: [
    "travel videos",
    "family moments",
    "tech reviews",
    "nature documentaries",
    "cooking tutorials",
    "fitness workouts",
    "music videos",
    "educational content"
  ]
};