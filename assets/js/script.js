/*------------------------------------------------------------------
* Bootstrap Simple Admin Template
* Version: 3.0
* Author: Alexis Luna
* Website: https://github.com/alexis-luna/bootstrap-simple-admin-template
-------------------------------------------------------------------*/
(function () {
    'use strict';

    // Toggle sidebar on Menu button click
  

    // Auto-hide sidebar on window resize if window size is small
    // $(window).on('resize', function () {
    //     if ($(window).width() <= 768) {
    //         $('#sidebar, #body').addClass('active');
    //     }
    // });

    // Hàm tải sidebar
    function loadSidebar() {
        return new Promise((resolve) => {
            $('#sidebar-container').load('sidebar/sidebar.html', function (response, status, xhr) {
                if (status === "error") {
                    console.error("Lỗi khi tải sidebar:", xhr.status, xhr.statusText);
                    resolve(false);
                } else {
                    console.log("Sidebar đã được tải thành công");
                    resolve(true);
                }
            });
        });
    }

    // Hàm tải header
    function loadHeader() {
        return new Promise((resolve) => {
            $('#navbar-container').load('sidebar/header.html', function (response, status, xhr) {
                if (status === "error") {
                    console.error("Lỗi khi tải header:", xhr.status, xhr.statusText);
                    resolve(false);
                } else {
                    console.log("Header đã được tải thành công");
                    resolve(true);
                }
            });
        });
    }

    $(document).ready(function () {
        // Sử dụng Promise.all để tải cả header và sidebar
        Promise.all([loadSidebar(), loadHeader()]).then(() => {
            // Chạy các chức năng của trang sau khi header và sidebar đã được tải
            initPageFeatures();
        });
    });

    // Định nghĩa các tính năng của trang
    function initPageFeatures() {

        // Lấy thông tin người dùng từ localStorage
        var user = getAuthUser();
        console.log(user)
        if (user) {
            // Nếu đã đăng nhập, hiển thị tên tài khoản và nút đăng xuất
            $(".login-auth").html(`<i class="fas fa-user"></i> ${user.tenTaiKhoan} <i style="font-size: .8em;" class="fas fa-caret-down"></i>`);
            $(".logout-auth").hide(); // Hiển thị menu đăng xuất
            $('#logoutBtn').on('click', logout); // Gán sự kiện click cho nút logout

            $(".login-auth").on('click', function () {
                $(".logout-auth").toggle(); // Toggle hiển thị menu "Đăng xuất"
            });

        } else {
            // Nếu chưa đăng nhập, hiển thị Login và ẩn menu đăng xuất
            $(".login-auth").html(`<i class="fas fa-user"></i> Login`);
            $(".logout-auth").hide(); // Ẩn menu đăng xuất
        }
        $('#sidebarCollapse').on('click', function () {
            $('#sidebar').toggleClass('active');
            $('#body').toggleClass('active');
        });
    }

    // Hàm để xử lý đăng xuất
    function logout() {
        const confirmLogout = confirm("Bạn có chắc chắn muốn đăng xuất?");
        if (confirmLogout) {
            localStorage.removeItem('user'); // Xóa thông tin người dùng khỏi localStorage
            localStorage.removeItem('role');

            window.location.href = "/login.html"; // Chuyển hướng đến trang đăng nhập
        } else {
            // Nếu người dùng hủy đăng xuất, không làm gì cả
            console.log("Đăng xuất bị hủy");
        }  }



})();
