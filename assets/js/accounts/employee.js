$(document).ready(function () {
    const role = localStorage.getItem('role');  // Lấy role từ localStorage

    // Hàm tải dữ liệu người dùng từ API
    function loadUserData() {
        $.ajax({
            url: 'http://localhost:8080/api/loginAuth/employee?role=nhân viên', // Sửa lại URL theo yêu cầu
            type: 'GET',
            success: function (data) {
                // Xử lý dữ liệu trả về từ API
                let tableRows = '';
                data.forEach(function (user,index) {
                    tableRows += `
                        <tr>
                            <td>${index+1}</td> <!-- ID (UUID) -->
                            <td>${user.id}</td> <!-- ID (UUID) -->
                            <td>${user.maNguoiDung}</td> <!-- Mã người dùng, thay thế cho user.id -->
                            <td>${user.hoTen}</td> <!-- Họ tên -->
                            <td>${user.namSinh || 'N/A'}</td> <!-- Năm sinh (Nếu có) -->
                            <td>${user.diaChi || 'N/A'}</td> <!-- Địa chỉ -->
                            <td>${user.email || 'N/A'}</td> <!-- Email -->
                            <td>${user.sdt || 'N/A'}</td> <!-- Số điện thoại -->
                            <td>
                                ${role === 'Admin' ? 
                                    `<i id="trangThaiNguoiDung_${user.maNguoiDung}" class="fas fa-toggle-${user.trangThai ? 'on' : 'off'} status-toggle" style="font-size: 24px; color: ${user.trangThai ? 'green' : 'gray'}; cursor: pointer;" data-id="${user.id}"></i>` 
                                       : 
                                     `<i class="fas fa-lock" style="color: gray;"></i>`}
                            </td>
        
                            <td class="text-end">
                                ${role === 'Admin' ?
                                    `<button class="btn btn-outline-info btn-rounded" data-id="${user.id}"><i class="fas fa-pen"></i> Edit</button>
                                    <button class="btn btn-outline-danger btn-rounded" data-id="${user.id}"><i class="fas fa-trash"></i> Delete</button>`
                                    :`<span class="fas fa-lock" style="color: gray;"></span>`}
                            </td>
                        </tr>
                    `;
                });
                $('#employeeTableBody').html(tableRows);
                registerStatusToggle(); // Đăng ký lại sự kiện sau khi bảng được cập nhật
            },
            error: function (xhr, status, error) {
                alert('Có lỗi xảy ra khi tải dữ liệu.');
            }
        });
    }

    loadUserData();  // Tải dữ liệu khi trang được tải xong

    // Hàm đăng ký sự kiện click cho các icon trạng thái
    function registerStatusToggle() {
        $('.status-toggle').click(function () {
            var icon = $(this);  // Lưu đối tượng icon vào một biến
            var userId = icon.data('id');  // Lấy userId từ thuộc tính data-id
            console.log("Mã người dùng:", userId); // Kiểm tra giá trị của userId

            var currentStatus = icon.hasClass('fa-toggle-on');  // Kiểm tra trạng thái hiện tại (đang bật hay tắt)
            var newStatus = !currentStatus;  // Đảo trạng thái

            if (!confirm(`Bạn có chắc chắn muốn ${newStatus ? 'bật' : 'tắt'} trạng thái của nhân viên này này?`)) {
                return;  // Nếu người dùng không xác nhận, dừng hành động
            }

            // Kiểm tra xem userId có phải là UUID hợp lệ không
            if (!isValidUUID(userId)) {
                alert("Mã người dùng không hợp lệ.");
                return;
            }

            // Gửi yêu cầu PUT để cập nhật trạng thái
            $.ajax({
                url: `http://localhost:8080/api/loginAuth/updateStatus/${userId}?trangThai=${newStatus}`,
                type: 'PUT',
                success: function (response) {
                    // Cập nhật icon và màu sắc theo trạng thái mới
                    if (newStatus) {
                        icon.removeClass('fa-toggle-off')
                            .addClass('fa-toggle-on')
                            .css('color', 'green');
                    } else {
                        icon.removeClass('fa-toggle-on')
                            .addClass('fa-toggle-off')
                            .css('color', 'gray');
                    }
                    alert('Cập nhật trạng thái thành công!');
                },
                error: function () {
                    alert('Có lỗi xảy ra khi cập nhật trạng thái.');
                }
            });
        });
    }

    // Kiểm tra xem giá trị có phải là UUID hợp lệ không
    function isValidUUID(uuid) {
        var regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return regex.test(uuid);
    }

    // Sử dụng Event Delegation để gắn sự kiện cho nút Edit và Delete
    $('#employeeTableBody').on('click', '.btn-outline-info', function () {
        const userId = $(this).data('id');
        openEditForm(userId);
    });

    $('#employeeTableBody').on('click', '.btn-outline-danger', function () {
        const userId = $(this).data('id');
        deleteAccount(userId);
    });





    // Hàm xóa tài khoản người dùng
    function deleteAccount(id) {
        if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            // Gửi yêu cầu xóa tài khoản người dùng
            $.ajax({
                url: `http://localhost:8080/api/loginAuth/deleteUser/${id}`,  // API xóa người dùng
                type: 'DELETE',
                success: function (response) {
                    alert('Xóa người dùng thành công!');
                    loadUserData();  // Tải lại danh sách người dùng sau khi xóa
                },
                error: function () {
                    alert('Có lỗi xảy ra khi xóa người dùng.');
                }
            });
        }
    }

    // Hàm mở form chỉnh sửa thông tin người dùng
    // Hàm mở form chỉnh sửa thông tin người dùng
    // Hàm mở form chỉnh sửa thông tin người dùng

    // Open the edit modal and populate it with user data
    function openEditForm(userId) {
        $.ajax({
            url: `http://localhost:8080/api/loginAuth/getUser/${userId}`, // API endpoint to fetch user by ID
            type: 'GET',
            success: function (data) {

                $('#id').val(data.id);  // Populate ID
                $('#hoTen').val(data.hoTen);
                $('#namSinh').val(data.namSinh);
                $('#diaChi').val(data.diaChi);
                $('#email').val(data.email);
                $('#sdt').val(data.sdt);
                $('#maNguoiDung').val(data.maNguoiDung); // Populate hidden field

                $('#editEmployeeModal').modal('show');
            },
            error: function () {
                alert('Có lỗi xảy ra khi tải dữ liệu người dùng.');
            }
        });
    }


    $('#saveChangesButton').on('click', function () {
        const userId = $('#id').val();  // Retrieve the user ID from the modal

        const updatedUser = {
            hoTen: $('#hoTen').val(),
            namSinh: $('#namSinh').val(),
            diaChi: $('#diaChi').val(),
            email: $('#email').val(),
            sdt: $('#sdt').val(),
            maNguoiDung: $('#maNguoiDung').val()  // Include maNguoiDung if needed
        };

        

        // Kiểm tra trùng email
        console.log("Kiểm tra email:", updatedUser.email);
        // $.ajax({
        //     url: `http://localhost:8080/api/loginAuth/checkEmail?email=${updatedUser.email}`,
        //     type: 'GET',
        //     success: function (response) {
        //         console.log("Response kiểm tra email:", response);
        //         if (response.exists) {
        //             alert('Email này đã được sử dụng bởi người dùng khác.');
        //             return;
        //         }

        //         // Kiểm tra trùng số điện thoại
        //         console.log("Kiểm tra số điện thoại:", updatedUser.sdt);
        //         $.ajax({
        //             url: `http://localhost:8080/api/loginAuth/checkSdt?sdt=${updatedUser.sdt}`,
        //             type: 'GET',
        //             success: function (response) {
        //                 console.log("Response kiểm tra số điện thoại:", response);
        //                 if (response.exists) {
        //                     alert('Số điện thoại này đã được sử dụng bởi người dùng khác.');
        //                     return;
        //                 }

        // Tiến hành gửi yêu cầu cập nhật nếu không có lỗi
        $.ajax({
            url: `http://localhost:8080/api/loginAuth/updateUser/${userId}`,
            type: 'PUT',
            data: JSON.stringify(updatedUser),
            contentType: 'application/json',
            success: function (response) {
                alert('Cập nhật thông tin người dùng thành công!');
                $('#editEmployeeModal').modal('hide');
                loadUserData();
            },
            error: function () {
                alert('Có lỗi xảy ra khi cập nhật thông tin người dùng.');
            }
        });
    }),
        // error: function () {
        //     console.error("Lỗi khi kiểm tra số điện thoại");
        //     alert('Có lỗi xảy ra khi kiểm tra số điện thoại.');
        // }
        // });
        //     },
        //     error: function () {
        //         console.error("Lỗi khi kiểm tra email");
        //         alert('Có lỗi xảy ra khi kiểm tra email.');
        //     }
        // });

        // });


        $('#closeButton').on('click', function () {
            $('#editEmployeeModal').modal('hide');
            // });
        });
});
