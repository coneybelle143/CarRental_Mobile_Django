export const boardingHouses = [
  {
    id: '1',
    name: 'Sunrise Boarding House',
    price: 3500,
    location: 'Divisoria, Cagayan de Oro',
    rating: 0,
    reviews: 0,    
    images: [
      'https://q-xx.bstatic.com/xdata/images/hotel/max500/410394094.jpg?k=cce2a4d520a8a46c2188d53163afe508d71c3e43f3dc8a64448ba09cda13b116&o=',
      'https://q-xx.bstatic.com/xdata/images/hotel/max500/160733814.jpg?k=5ee8bfbefc802123d9c3970cea3c2f51953b7854e10c665456407437c5fbe1d2&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/497806866.jpg?k=4a330f6ff9d5a80ae4613403826d225632b149851e5b085a8080e451c08ad8f2&o='
    ],
    floorPlans: ['https://example.com/floorplan1.jpg'],
    virtualTourUrl: 'https://example.com/virtual-tour',
    type: 'Single Room',
    amenities: ['WiFi', 'Laundry', 'Kitchen', 'CR', 'Utilities Included'],
    distance: '0.8 km',
    description: 'Cozy single rooms with basic amenities. Perfect for students and working professionals.',
    landlord: {
      name: 'Saul Goodman',
      phone: '09123456789',
      verified: true,
    }
  },
  {
    id: '2',
    name: 'CDO Student Dorm',
    price: 2800,
    location: 'Nazareth, Cagayan de Oro',
    rating: 0,
    reviews: 0,    
    images: [
      'https://i.ytimg.com/vi/yEwHy_U9ZKE/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGFUgXyhlMA8=&rs=AOn4CLCh2RvNAlKiqAwmrofXeupwFcvEFg',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/560858655.jpg?k=37451059691736cd90e025ea14705eebafb92b2793f25b43da91aa40dff8ec3e&o='
    ],
    floorPlans: [],
    virtualTourUrl: null,
    type: 'Shared Room',
    amenities: ['WiFi', 'Study Area', 'CR', '24/7 Security'],
    distance: '1.2 km',
    description: 'Affordable shared accommodation for students near universities.',
    landlord: {
      name: 'Mike Ehrmantraut',
      phone: '09198765432',
      verified: true
    }
  },
  {
    id: '3',
    name: 'Green Valley Apartelle',
    price: 4500,
    location: 'Carmen, Cagayan de Oro',
    rating: 0,
    reviews: 0,    
    images: [
      'https://josoromabuilders.wordpress.com/wp-content/uploads/2019/04/pers-01.jpg',
      'https://jcs-boarding-house.getmanilahotels.com/data/Pictures/OriginalPhoto/6009/600927/600927660/manila-jcs-boarding-house-picture-5.JPEG'
    ],
    floorPlans: [],
    virtualTourUrl: null,
    type: 'Shared Room',
    amenities: ['WiFi', 'Aircon', 'Kitchen', 'CR', 'Parking', 'Pets Allowed'],
    distance: '2.1 km',
    description: 'Modern studio units with complete amenities for comfortable living.',
    landlord: {
      name: 'Gustavo Fring',
      phone: '09151234567',
      verified: true
    }
  },
  {
    id: '4',
    name: 'XU Area Boarding',
    price: 3200,
    location: 'Corrales Ext, Cagayan de Oro',
    rating: 0,
    reviews: 0,    
    images: [
      'https://img1.wsimg.com/isteam/ip/a19e7d0d-593a-464c-a9c8-b3a2fe8b40e8/68771ea1-50da-41f1-bb68-88599351ce8d.jpeg/:/rs=h:1000,cg:true,m',
      'https://media-cdn.tripadvisor.com/media/photo-s/06/e2/98/b0/chill-out-guesthouse.jpg'
    ],
    floorPlans: [],
    virtualTourUrl: null,
    type: 'Single Room',
    amenities: ['WiFi', 'CR', 'Study Area'],
    distance: '0.5 km',
    description: 'Walking distance to Xavier University. Ideal for students.',
    landlord: {
      name: 'Tuco Salamanca',
      phone: '09159876543',
      verified: false
    }
  },
  {
    id: '5',
    name: 'Downtown Comfort',
    price: 5200,
    location: 'Lapasan, Cagayan de Oro',
    rating: 0,
    reviews: 0,    
    images: [
      'https://kaoonta.com/wp-content/uploads/2025/05/Tirasol-Boarding-House-Ma-a.webp',
      'https://www.piliko.com/media/fotos/casita_starosa_1_1407230229.jpg'
    ],
    floorPlans: [],
    virtualTourUrl: null,
    type: 'Shared Room',
    amenities: ['WiFi', 'Aircon', 'Kitchen', 'CR', 'Parking', 'Laundry'],
    distance: '1.8 km',
    description: 'Premium studio units with complete facilities and security.',
    landlord: {
      name: 'Walter White',
      phone: '09157778899',
      verified: true
    }
  }
];

export const notifications = [
  {
    id: '1',
    title: 'New Boarding House Available',
    message: 'Sunrise Boarding House has new rooms available near Xavier University.',
    time: '2 hours ago',
    type: 'new_listing',
    read: false,
    actionable: true,
  },
  {
    id: '2',
    title: 'Booking Confirmed',
    message: 'Your booking at CDO Student Dorm has been confirmed for March 2024.',
    time: '1 day ago',
    type: 'booking',
    read: true,
    actionable: true,
  },
  {
    id: '3',
    title: 'Payment Due Soon',
    message: 'Your monthly payment of ₱3,500 is due in 3 days for Sunrise Boarding.',
    time: '2 days ago',
    type: 'payment',
    read: true,
    actionable: true,
  }
];

export const messages = [
  {
    id: '1',
    landlord: {
      name: 'Saul Goodman',
      image: 'https://media.licdn.com/dms/image/v2/C4D12AQEMLLk06x2Wbw/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1520167327484?e=2147483647&v=beta&t=r-IZtKjxlD6syVp4W8xSThCYNrbiNI6qOrfqjO27qCk',
    },
    lastMessage: 'Where are you? Call me.',
    time: '10:30 AM',
    unread: true
  },
  {
    id: '2',
    landlord: {
      name: 'Mike Ehrmantraut',
      image: 'https://static.wikia.nocookie.net/breakingbad/images/9/9f/Season_4_-_Mike.jpg/revision/latest?cb=20250728074206',
    },
    lastMessage: 'I got the room cleaned for you, kid.',
    time: 'Yesterday',
    unread: false
  },
  {
    id: '3',
    landlord: {
      name: 'Walter White',
      image: 'https://i.pinimg.com/736x/50/4d/ab/504dab425e2cda6b74b3fd57e56baa30.jpg',
    },
    lastMessage: 'Wanna cook?',
    time: 'Yesterday',
    unread: false
  },
  {
    id: '4',
    landlord: {
      name: 'Brandon Mayhew',
      image: 'https://static.wikia.nocookie.net/breakingbad/images/a/ac/Badger_2008.png/revision/latest?cb=20220815164007',
    },
    lastMessage: 'Me: Yo!',
    time: 'Yesterday',
    unread: false
  },
  {
    id: '5',
    landlord: {
      name: 'Skinny Pete',
      image: 'https://static.wikia.nocookie.net/breakingbad/images/e/ea/Skinny_Pete_2009.png/revision/latest?cb=20200611125059',
    },
    lastMessage: 'Be there at noon, yo.',
    time: '2 days ago',
    unread: false
  },
  {
    id: '6',
    landlord: {
      name: 'Skyler White',
      image: 'https://ew.com/thmb/c-e9oofgxwj9jDc9qWm2RLVND1I=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/breaking-bad-anna-gunn-1-101ba7b9fc7443709d9b75e47aeb2e93.jpg',
    },
    lastMessage: 'Well. My name is Skyler White, yo.',
    time: '2 days ago',
    unread: false
  }
];