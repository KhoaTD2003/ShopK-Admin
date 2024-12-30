
$(document).ready(function () {
    const role = localStorage.getItem('role');  // Lấy role từ localStorage

    loadUserData()




    function loadUserData(pageNumber = 0, selectedStatus = null, searchKeyword = '') {
        const roLe = 'nhân viên'; // Vai trò người dùng
        console.log('Gọi loadUserData với các tham số:', pageNumber, searchKeyword, selectedStatus);

        const requestData = {
            role: roLe,
            pageNumber: pageNumber,
            tenTaiKhoan: searchKeyword,
            sdt: searchKeyword,
            trangThai: selectedStatus !== null ? selectedStatus : '', // Lấy trạng thái từ giao diện
        };

        console.log('Giá trị tham số trước khi gọi API:', requestData);

        $.ajax({
            url: `http://localhost:8080/api/loginAuth/employee`,
            type: 'GET',
            data: requestData,
            success: function (data) {
                console.log('Dữ liệu từ API: ', data);  // Log dữ liệu trả về
                console.log('Số lượng người dùng trả về:', data.content.length); // Kiểm tra số lượng người dùng

                let tableRows = '';
                if (data.content.length === 0) {
                    console.log('Không có dữ liệu nào được tìm thấy !'); // Thông báo không có dữ liệu
                    tableRows = `
                    <tr>
                        <td colspan="11" class="text-center" style="font-weight: bold;
                                 color: #555;">NO DATA FOUND !</td>                
                    </tr>
                    `; 
                } else {
                    data.content.forEach(function (user, index) {
                        console.log('Trang thái của user:', user.trangThai);  // Kiểm tra trạng thái của từng người dùng

                        tableRows += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${user.tenTaiKhoan}</td>
                                <td>${user.sdt}</td>
                                <td>${user.email || 'N/A'}</td>

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
                                : `<span class="fas fa-lock" style="color: gray;"></span>`}
                                </td>
                            </tr>
                        `;
                    });
                }
                $('#employeeTableBody').html(tableRows);  // Cập nhật bảng
                registerStatusToggle();  // Đăng ký lại sự kiện
                renderPaginatio(data.totalPages, pageNumber);  // Cập nhật phân trang
            },
            error: function (xhr, status, error) {
                console.error('Có lỗi xảy ra khi tải dữ liệu:', error);
                alert('Có lỗi xảy ra khi tải dữ liệu.');
            }
        });
    }

    // Xử lý sự kiện tìm kiếm
    $('#searchKeyword').on('input', function () {
        const searchKeyword = $(this).val(); // Lấy từ khóa người dùng nhập
        const selectedStatus = $('#sortStatus').val() === 'true' ? true : $('#sortStatus').val() === 'false' ? false : null; // Lấy trạng thái hiện tại
        loadUserData(0, selectedStatus, searchKeyword); // Gọi hàm loadUserData với các tham số
    });

    // Xử lý sự kiện thay đổi trạng thái
    $('#sortStatus').on('change', function () {
        let selectedStatus = $(this).val();
        selectedStatus = selectedStatus === '' ? null : (selectedStatus === 'true'); // Chuyển giá trị 'true'/'false' thành boolean

        console.log('Trạng thái được chọn: ', selectedStatus);  // Kiểm tra giá trị

        const searchKeyword = $('#searchKeyword').val(); // Lấy từ khóa tìm kiếm hiện tại
        loadUserData(0, selectedStatus, searchKeyword); // Truyền cả hai tham số
    });

    function renderPaginatio(totalPages, currentPage) {
        let paginationHtml = '';
        for (let i = 0; i < totalPages; i++) {
            paginationHtml += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                                    <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
                               </li>`;
        }
        $('#pagination').html(paginationHtml);
    }

    // Bắt sự kiện khi click vào các nút phân trang
    $('#pagination').on('click', '.page-link', function (e) {
        e.preventDefault();
        const pageNumber = $(this).data('page');  // Lấy số trang từ thuộc tính data-page
        loadUserData(pageNumber);  // Tải dữ liệu của trang tương ứng
    });



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
                $('#hoTen').val(data.tenTaiKhoan);
                $('#email').val(data.email);
                $('#sdt').val(data.sdt);
                $('#role').val(data.role);
                $('#password').val(data.matKhau);

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
            tenTaiKhoan: $('#hoTen').val(),
            email: $('#email').val(),
            sdt: $('#sdt').val(),
            id: $('#id').val() , // Include maNguoiDung if needed
            role: $('#role').val(),  // Include maNguoiDung if needed
            matKhau:$('#password').val(),
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

