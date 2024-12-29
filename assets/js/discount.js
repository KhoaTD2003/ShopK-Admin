$(document).ready(function () {

    function loadDiscount(pageNumber = 0) {

        const searchKeyword = $('#searchKeyword').val();
        const selectedStatus = $('#sortStatus').val();
        const discountType = $('input[name="loaiGiam"]:checked').val() || 'all'; // Mặc định là 'all' nếu không có lựa chọn

        const requestData = {
            pageNumber: pageNumber,
            ten: searchKeyword,
            ma: searchKeyword,
            trangThai: selectedStatus !== null ? selectedStatus : '',
            // giamGia: discountType  // Nếu không có loại nào được chọn, mặc định là 'all'
        };

        $.ajax({
            url: `http://127.0.0.1:8080/api/giamgia/page`, // Đường dẫn API có hỗ trợ sắp xếp
            type: 'GET',
            data: requestData, // Truyền dữ liệu dưới dạng đối tượng
            success: function (data) {
                console.log(data);
                let tableRows = '';
                if (data.content.length === 0) {
                    tableRows = `
                        <tr>
                            <td colspan="11" class="text-center" style="font-weight: bold;
                                 color: #555;">NO DATA FOUND !</td>                
                            </td>                
                        </tr>
                    `;
                } else {
                    data.content.forEach(function (discount, index) {

                        let now = (discount.ngayTao).toLocaleString().slice(0, 19).replace("T", " "); // Định dạng ngày bắt đầu
                        let startDate = (discount.ngayBatDau).toLocaleString().slice(0, 19).replace("T", " "); // Định dạng ngày bắt đầu
                        let endDate = (discount.ngayKetThuc).toLocaleString().slice(0, 19).replace("T", " "); // Định dạng ngày kết thúc

                        // let giamGiaDisplay = discount.giamGia;

                        // // Kiểm tra xem giá trị giảm giá có phải là phần trăm không
                        // if (giamGiaDisplay.includes('%')) {
                        //     // Nếu có dấu % thì giữ nguyên
                        //     giamGiaDisplay = giamGiaDisplay;
                        // } else {
                        //     // Nếu không có dấu % thì thêm "Đ" vào
                        //     giamGiaDisplay = formatCurrency(giamGiaDisplay);

                        // }
                        let giamGiaDisplay = discount.giamGia;

                        // Kiểm tra giá trị giảm giá và định dạng
                        let isPercent = giamGiaDisplay.trim().endsWith('%'); // Kiểm tra nếu có dấu %

                        if (isPercent) {
                            // Nếu là phần trăm, giữ nguyên
                            giamGiaDisplay = giamGiaDisplay;
                        } else {
                            // Nếu không là phần trăm, định dạng giá trị tiền
                            giamGiaDisplay = formatCurrency(giamGiaDisplay);
                        }

                        // Lọc theo loại giảm giá
                        let shouldDisplay = false;
                        if (discountType === 'all') {
                            shouldDisplay = true; // Hiển thị tất cả
                        } else if (discountType === 'phanTram' && isPercent) {
                            shouldDisplay = true; // Hiển thị nếu là phần trăm
                        } else if (discountType === 'vnd' && !isPercent) {
                            shouldDisplay = true; // Hiển thị nếu là giá tiền
                        }

                        // Nếu điều kiện lọc đúng, thêm hàng vào bảng
                        if (shouldDisplay) {
                            tableRows += `
                    
                        <tr>
                            <td>${index + 1}</td> <!-- Mã sản phẩm -->
                            <td>${discount.ma}</td> <!-- Mã sản phẩm -->
                            <td>${discount.ten}</td> <!-- Mã sản phẩm -->
                            <td>${now}</td> <!-- Tên sản phẩm -->
                            <td>${startDate}</td> <!-- Tên sản phẩm -->
                            <td>${endDate}</td> <!-- Tên sản phẩm -->
                            <td>${giamGiaDisplay}</td> <!-- Tên sản phẩm -->
                            <td>${formatCurrency(discount.giaTriMin)}</td> <!-- Tên sản phẩm -->
                            <td>${discount.soLansd}</td> <!-- Tên sản phẩm -->

                            <td>
                                <!-- Trạng thái sản phẩm: ON/OFF -->
                                <i class="fas fa-toggle-${discount.trangThai ? 'on' : 'off'} status-toggle" data-id="${discount.id}" style="font-size: 24px; color: ${discount.trangThai ? 'green' : 'gray'};"></i>
                            </td>
                            <td>
                                <button class="btn btn-outline-info btn-rounded" data-id="${discount.id}"><i class="fas fa-pen"></i> Edit</button>
                                <button class="btn btn-outline-danger btn-rounded" data-id="${discount.id}"><i class="fas fa-trash"></i> Delete</button>
                            </td>
                        </tr>
                        `;
                        }
                    });
                }
                $('#discountTableBody').html(tableRows);
                registerStatusToggle(); // Đăng ký sự kiện toggle trạng thái
                renderPaginatio(data.totalPages, pageNumber);

            },

            error: function (xhr, status, error) {
                alert('Có lỗi xảy ra khi tải dữ liệu sản phẩm.');
            }
        });
    }
    $('#searchKeyword, #sortStatus, input[name="loaiGiam"]').on('change keyup', function () {
        loadDiscount();
    });

    function formatCurrency(amount) {
        if (typeof amount !== 'number') amount = Number(amount); // Đảm bảo đầu vào là số
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }
    function registerStatusToggle() {
        $('.status-toggle').click(function () {
            var icon = $(this);  // Lưu đối tượng icon vào một biến
            var id = icon.data('id');  // Lấy userId từ thuộc tính data-id
            console.log("id giam gia:", id); // Kiểm tra giá trị của userId

            var currentStatus = icon.hasClass('fa-toggle-on');  // Kiểm tra trạng thái hiện tại (đang bật hay tắt)
            var newStatus = !currentStatus;  // Đảo trạng thái

            if (!confirm(`Bạn có chắc chắn muốn ${newStatus ? 'bật' : 'tắt'} trạng thái của phiếu giảm giá này?`)) {
                return;  // Nếu người dùng không xác nhận, dừng hành động
            }

            // Kiểm tra xem userId có phải là UUID hợp lệ không
            if (!isValidUUID(id)) {
                console.log(id);
                alert("Mã sản phẩm không hợp lệ.");
                return;
            }

            // Gửi yêu cầu PUT để cập nhật trạng thái
            $.ajax({
                url: `http://localhost:8080/api/giamgia/upStatusDiscount/${id}?trangThai=${newStatus}`,
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
                    alert(response);
                },
                error: function (xhr) {
                    alert(xhr.responseText);
                }
            });
        });
    }
    function isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
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
        loadDiscount(pageNumber);  // Tải dữ liệu của trang tương ứng
    });


    loadDiscount();


    $('#discountTableBody').on('click', '.btn-outline-info', function () {
        const Id = $(this).data('id');
        openEditForm(Id);
    });

    $('#discountTableBody').on('click', '.btn-outline-danger', function () {
        const Id = $(this).data('id');
        deleteDiscount(Id);
    });

    function deleteDiscount(Id) {
        if (confirm('Bạn có chắc chắn muốn xóa giảm giá này?')) {
            // Gửi yêu cầu xóa tài khoản người dùng
            $.ajax({
                url: `http://localhost:8080/api/giamgia/${Id}`,  // API xóa người dùng
                type: 'DELETE',
                success: function (response) {
                    alert('Discount deleted successfully!');
                    loadDiscount();
                },
                error: function () {
                    alert('Có lỗi xảy ra khi xóa người dùng.');
                }
            });
        }
    }


    // Hàm chuyển đổi ngày ISO 8601 (ví dụ: "2024-12-17T00:00:00.000+00:00") sang định dạng yyyy-MM-dd
    function formatDateToISO(dateString) {
        var date = new Date(dateString);  // Chuyển chuỗi ISO 8601 thành đối tượng Date
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().padStart(2, '0');  // Tháng (0-11), cộng 1 để trở thành tháng (1-12)
        var day = date.getDate().toString().padStart(2, '0');  // Ngày (1-31)

        return `${year}-${month}-${day}`;  // Trả về định dạng yyyy-MM-dd
    }

    // Hàm mở form chỉnh sửa mã giảm giá
    function openEditForm(Id) {
        // Gửi AJAX request để lấy dữ liệu mã giảm giá theo Id
        $.ajax({
            url: `http://localhost:8080/api/giamgia/${Id}`,  // API xóa người dùng
            type: "GET",
            success: function (data) {
                console.log(data);
                // Hiển thị dữ liệu trong form
                $("#Id").val(data.id),
                    $("#Code").val(data.ma); // Mã giảm giá
                $("#Name").val(data.ten); // Tên giảm giá
                var startDate = formatDateToISO(data.ngayBatDau);
                var endDate = formatDateToISO(data.ngayKetThuc);
                $("#stDate").val(startDate); // Ngày bắt đầu
                $("#enDate").val(endDate); // Ngày kết thúc

                // $("#stDate").val(data.ngayBatDau); // Ngày bắt đầu
                // $("#enDate").val(data.ngayKetThuc); // Ngày kết thúc
                $("#percentage").val(data.giamGia); // Giá trị giảm giá
                $("#usLimit").val(data.soLansd); // Số lần sử dụng
                $("#inValue").val(data.giaTriMin); // Giá trị tối thiểu
                $("#tt").val(data.trangThai.toString()); // Trạng thái (true/false)

                // Hiển thị modal chỉnh sửa
                $("#editDiscountModal").modal("show");
            },
            error: function (xhr) {
                // Xử lý lỗi nếu không tìm thấy mã giảm giá
                if (xhr.status === 404) {
                    alert("Không tìm thấy mã giảm giá.");
                } else {
                    alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
                }
            }
        });
    }



    $('#editDiscountButton').click(function (event) {
        if (confirm('Bạn có chắc chắn muốn sửa mã giảm giá này?')) {
            event.preventDefault();

            const discountData = {
                id: $("#Id").val(),
                ma: $("#Code").val(),
                ten: $("#Name").val(),
                giamGia: $("#percentage").val(),
                ngayBatDau: $("#stDate").val(),
                ngayKetThuc: $("#enDate").val(),
                soLansd: $("#usLimit").val(),
                giaTriMin: $("#inValue").val(),
                trangThai: $("#tt").val() === "true"
            };

            var hasError = false;

            // Kiểm tra các trường thông tin
            if (discountData.ma === "") {
                $("#maError").text("Mã giảm giá không được để trống.");
                hasError = true;
            } else {
                $("#maError").text("");
            }

            if (discountData.ten === "") {
                $("#tenError").text("Tên giảm giá không được để trống.");
                hasError = true;
            } else {
                $("#tenError").text("");
            }

            if (discountData.giamGia === "") {
                $("#ggError").text("Giảm giá không được để trống.");
                hasError = true;
            } else {
                $("#ggError").text("");
            }

            if (discountData.ngayBatDau === "") {
                $("#stDateError").text("Bắt buộc chọn ngày");
                hasError = true;
            }

            if (discountData.ngayKetThuc === "") {
                $("#enDateError").text("Bắt buộc chọn ngày");
                hasError = true;
            }

            if (!discountData.ngayBatDau || !discountData.ngayKetThuc || (discountData.ngayBatDau) > (discountData.ngayKetThuc)) {
                alert('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
                hasError = true;
            }

            if (discountData.soLansd <= 0) {
                $("#LansdError").text("Số lần sử dụng phải lớn hơn 0.");
                hasError = true;
            } else {
                $("#LansdError").text("");
            }

            if (discountData.giaTriMin <= 0) {
                $("#ValueError").text("Giá trị tối thiểu phải lớn hơn 0.");
                hasError = true;
            } else {
                $("#ValueError").text("");
            }

            if (hasError) {
                return; // Dừng lại nếu có lỗi
            }
            console.log("Updating discount with ID: ", discountData.id);
            // Gửi AJAX đến API
            $.ajax({
                url: `http://localhost:8080/api/giamgia/discount/${discountData.id}`, // Đảm bảo URL đúng
                type: "PUT",
                contentType: "application/json", // Gửi dữ liệu dưới dạng JSON
                data: JSON.stringify(discountData), // Dữ liệu gửi đi dưới dạng JSON
                success: function (response) {
                    // Xử lý khi cập nhật thành công
                    alert("Cập nhật mã giảm giá thành công!");
                    $("#editDiscountModal").modal("hide");
                    // Tải lại danh sách giảm giá (nếu có)
                    loadDiscount();
                },
                error: function (xhr) {
                    // Xử lý khi có lỗi
                    if (xhr.status === 400) {
                        alert("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
                    } else if (xhr.status === 404) {
                        alert("Không tìm thấy mã giảm giá.");
                    } else {
                        alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
                    }
                }
            });
        }
    });

    $('#editcloseButton, #close').on('click', function () {
        $('#editDiscountModal').modal('hide');
        // });
    });

    $('#addDiscountButton').click(function (event) {
        event.preventDefault();

        // Lấy dữ liệu từ form
        const code = $('#discountCode').val().trim();
        const name = $('#discountName').val().trim();
        const startDate = $('#startDate').val().trim();
        const endDate = $('#endDate').val().trim();
        const discountPercentage = $('#discountPercentage').val().trim();
        const usageLimit = $('#usageLimit').val().trim();
        const status = $('#status').val();
        let minTotal = $('#minValue').val().trim(); // Lấy giá trị minValue

        if (!minTotal) {
            minTotal = 0;
        } else if (isNaN(minTotal) || Number(minTotal) < 0) {
            $('#minValueError').text('Giá trị tối thiểu phải là số và lớn hơn hoặc bằng 0.');
            return; // Nếu giá trị không hợp lệ, ngừng xử lý
        } else {
            $('#minValueError').text('');
        }

        // Kiểm tra dữ liệu
        let hasError = false;

        // if (!minTotal) {
        //     minTotal = 0;
        // } else if (isNaN(minTotal) || Number(minTotal) < 0) {
        //     $('#minValueError').text('Giá trị tối thiểu phải là số và lớn hơn hoặc bằng 0.');
        //     return; // Nếu giá trị không hợp lệ, ngừng xử lý
        // } else {
        //     $('#minValueError').text('');
        // }

        if (!code) {
            $('#codeError').text('Mã không được để trống');
            hasError = true;
        } else {
            $('#codeError').text('');
        }

        if (!name) {
            $('#nameError').text('Tên không được để trống');
            hasError = true;
        } else {
            $('#nameError').text('');
        }

        if (!startDate || !endDate || (startDate) > (endDate)) {
            alert('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
            hasError = true;
        }

        // if (!discountPercentage || isNaN(discountPercentage) || Number(discountPercentage) <= 0) {
        //     $('#giamGiaError').text('Giảm giá phải là số và lớn hơn 0');
        //     // alert('Giảm giá phải là số và lớn hơn 0.');
        //     hasError = true;
        // }
        // Kiểm tra giá trị giảm giá
        let discountAmount = null;
        if (!discountPercentage) {
            $('#giamGiaError').text('Giảm giá không được để trống');
            hasError = true;
        } else {
            // Kiểm tra xem giảm giá có phải là phần trăm hay số tiền
            if (discountPercentage.includes('%')) {
                let percentage = discountPercentage.replace('%', '').trim(); // Loại bỏ dấu '%' và lấy phần số
                if (isNaN(percentage) || Number(percentage) <= 0 || Number(percentage) > 100) {
                    $('#giamGiaError').text('Giảm giá phần trăm phải là một số trong khoảng từ 0 đến 100');
                    hasError = true;
                } else {
                    discountAmount = percentage + '%'; // Giảm giá phần trăm
                }
            } else {
                if (isNaN(discountPercentage) || Number(discountPercentage) <= 0) {
                    $('#giamGiaError').text('Giảm giá phải là số và lớn hơn 0');
                    hasError = true;
                } else {
                    discountAmount = discountPercentage; // Giảm giá số tiền
                }
            }
        }

        if (!usageLimit || isNaN(usageLimit) || Number(usageLimit) <= 0) {
            // alert('Số lần sử dụng phải là số và lớn hơn 0.');
            $('#soLansdError').text('Số lần sử dụng phải là số và lớn hơn 0.');

            hasError = true;
        }

        if (hasError) return;

        // Xác nhận thêm mới
        if (confirm('Bạn có chắc chắn muốn thêm mã giảm giá này?')) {
            // Gửi yêu cầu thêm giảm giá
            $.ajax({
                url: 'http://localhost:8080/api/giamgia',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    ma: code,
                    ten: name,
                    ngayBatDau: startDate,
                    ngayKetThuc: endDate,
                    giamGia: discountPercentage,
                    soLansd: usageLimit,
                    giaTriMin: minTotal, // Gửi giá trị minTotal vào request
                    trangThai: status === "true"
                }),
                success: function () {
                    alert("Thêm giảm giá thành công!");
                    $('#addDiscountForm')[0].reset(); // Reset form
                    $('#addDiscountModal').modal('hide'); // Đóng modal
                    window.location.reload(); // Reload lại trang để cập nhật danh sách
                },
                error: function (xhr) {
                    if (xhr.status === 400 && xhr.responseJSON) { // Lỗi do backend trả về
                        alert(xhr.responseJSON.message || 'Lỗi không xác định!');
                    } else {
                        // alert("Thêm giảm giá thất bại!");
                        alert(xhr.responseText);

                    }
                }
            });
        }
    });



})

