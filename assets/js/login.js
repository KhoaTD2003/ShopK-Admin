$(document).ready(function () {

    // checkLoginStatus();

    $("#loginForm").on("submit", function (event) {
        event.preventDefault(); // Ngăn chặn form submit truyền thống

        // Lấy giá trị từ các trường input
        const tenTaiKhoan = $("#username").val();
        const matKhau = $("#password").val();

        // Kiểm tra các giá trị đầu vào
        if (!tenTaiKhoan || !matKhau) {
            alert("Vui lòng nhập tên tài khoản và mật khẩu.");
            return;
        }

        // Gửi yêu cầu AJAX đến API đăng nhập
        $.ajax({
            url: "http://localhost:8080/api/loginAuth",
            type: "POST",
            data: {
                tenTaiKhoan: tenTaiKhoan,
                matKhau: matKhau
            },
            success: function (response) {
                console.log("Đăng nhập thành công:", response);
                alert("Đăng nhập thành công!");

                // Lưu thông tin đăng nhập vào localStorage
                localStorage.setItem('user', JSON.stringify(response));
                localStorage.setItem('role', response.role); // Lưu vai trò từ API


                // Sau khi lưu, bạn có thể chuyển hướng người dùng đến trang khác nếu cần
                window.location.href = "customers.html"; // Ví dụ chuyển đến trang dashboard
            },
            error: function (xhr, status, error) {
                console.error("Lỗi:", xhr.responseText);
                alert("Đăng nhập thất bại: " + xhr.responseText);
            }
        });
    });



});

