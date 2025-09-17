const API_BASE_URL = window.location.protocol === 'http:' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : `${window.location.protocol}//${window.location.hostname}:5000/api`;

let currentUser = null;
let currentPage = 'login';