function getAuthUser() {
    return JSON.parse(localStorage.getItem('user')); // Trả về đối tượng người dùng nếu có, null nếu không có
}