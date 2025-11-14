import { defineStore } from 'pinia'
import { propertyApi, transformPropertyData } from '@/services/api'

// Dummy data for testing
const dummyProperties = [
  {
    _id: '1',
    title: 'Modern Downtown Apartment',
    type: 'rent',
    price: 2500,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    location: {
      address: '123 Main St, Anytown, USA',
      coordinates: [-74.006, 40.7128]
    },
    images: ['https://picsum.photos/seed/p1/800/600'],
    amenities: ['pool', 'gym', 'parking'],
    agent: {
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=John%20Doe'
    },
    createdAt: new Date().toISOString(),
    featured: true,
  },
  {
    _id: '2',
    title: 'Cozy Suburban House',
    type: 'sale',
    price: 350000,
    bedrooms: 3,
    bathrooms: 2.5,
    area: 2000,
    location: {
      address: '456 Oak Ave, Suburbia, USA',
      coordinates: [-73.9866, 40.7306]
    },
    images: ['https://picsum.photos/seed/p2/800/600'],
    amenities: ['backyard', 'garage', 'fireplace'],
    agent: {
      name: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Jane%20Smith'
    },
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    featured: false,
  },
  {
    _id: '3',
    title: 'Luxury Beachfront Villa',
    type: 'sale',
    price: 1200000,
    bedrooms: 5,
    bathrooms: 5,
    area: 4500,
    location: {
      address: '789 Ocean Blvd, Beachtown, USA',
      coordinates: [-73.9654, 40.7829]
    },
    images: ['https://picsum.photos/seed/p3/800/600'],
    amenities: ['private beach', 'infinity pool', 'home theater'],
    agent: {
      name: 'Sam Wilson',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sam%20Wilson'
    },
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    featured: true,
  },
    {
    _id: '4',
    title: 'Rustic Countryside Cabin',
    type: 'rent',
    price: 1200,
    bedrooms: 1,
    bathrooms: 1,
    area: 800,
    location: {
        address: '101 Forest Rd, Woodsville, USA',
        coordinates: [-74.006, 40.7128]
    },
    images: ['https://picsum.photos/seed/p4/800/600'],
    amenities: ['fireplace', 'hot tub', 'scenic view'],
    agent: {
        name: 'Peter Jones',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Peter%20Jones'
    },
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    featured: false,
    },
    {
    _id: '5',
    title: 'Chic Urban Loft',
    type: 'rent',
    price: 3500,
    bedrooms: 1,
    bathrooms: 1.5,
    area: 950,
    location: {
        address: '210 City Center, Metropolis, USA',
        coordinates: [-73.9866, 40.7306]
    },
    images: ['https://picsum.photos/seed/p5/800/600'],
    amenities: ['rooftop terrace', 'concierge', 'fitness center'],
    agent: {
        name: 'Maria Garcia',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Maria%20Garcia'
    },
    createdAt: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    featured: true,
    },
    {
    _id: '6',
    title: 'Spacious Family Home',
    type: 'sale',
    price: 550000,
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    location: {
        address: '734 Maple Dr, Greenville, USA',
        coordinates: [-73.9654, 40.7829]
    },
    images: ['https://picsum.photos/seed/p6/800/600'],
    amenities: ['large yard', 'playroom', 'two-car garage'],
    agent: {
        name: 'David Chen',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=David%20Chen'
    },
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    featured: false,
    }
];

export const usePropertyStore = defineStore('property', {
  state: () => ({
    properties: [],
    featuredProperties: [],
    currentProperty: null,
    loading: false,
    error: null,
    filters: {
      type: '',
      priceRange: '',
      bedrooms: '',
      bathrooms: '',
      location: '',
      sortBy: 'newest'
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasMore: false
    }
  }),

  getters: {
    filteredProperties: (state) => {
      return state.properties;
    }
  },

  actions: {
    async fetchProperties(params = {}) {
      this.loading = true;
      this.error = null;
      
      await new Promise(resolve => setTimeout(resolve, 500));

      this.properties = dummyProperties; // Bypassing the transform for dummy data
      this.pagination.totalItems = this.properties.length;
      this.pagination.hasMore = false;
      this.loading = false;
    },

    async fetchFeaturedProperties() {
      try {
        this.featuredProperties = dummyProperties.filter(p => p.featured);
      } catch (error) {
        console.error('Failed to fetch featured properties:', error)
      }
    },

    async fetchProperty(id) {
      this.loading = true;
      this.error = null;
      await new Promise(resolve => setTimeout(resolve, 300));
      const property = dummyProperties.find(p => p._id === id);
      if (property) {
        this.currentProperty = property;
      } else {
        this.error = "Property not found";
      }
      this.loading = false;
    },

    async createProperty(propertyData) {
      this.loading = true;
      const newProperty = {
        ...propertyData,
        _id: new Date().getTime().toString(),
        createdAt: new Date().toISOString(),
        images: ['https://picsum.photos/seed/new/800/600'],
        agent: { name: 'Current User', avatar: '' }
      };
      dummyProperties.push(newProperty);
      this.properties.unshift(newProperty);
      this.loading = false;
      return newProperty;
    },

    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
      this.pagination.currentPage = 1;
      this.fetchProperties();
    },

    clearFilters() {
      this.filters = {
        type: '',
        priceRange: '',
        bedrooms: '',
        bathrooms: '',
        location: '',
        sortBy: 'newest'
      }
      this.fetchProperties()
    },

    loadMore() {
      // No more to load in dummy data
    }
  }
})
