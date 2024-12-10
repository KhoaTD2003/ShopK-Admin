$(document).ready(function () {

    function loadDiscount(pageNumber = 0) {
        $.ajax({
            url: `http://127.0.0.1:8080/api/giamgia/page?pageNumber=${pageNumber}`, // Đường dẫn API có hỗ trợ sắp xếp
            type: 'GET',
            success: function (data) {
                let tableRows = '';
                data.content.forEach(function (discount, index) {

                    let now = (discount.ngayTao).toLocaleString().slice(0, 19).replace("T", " "); // Định dạng ngày bắt đầu
                    let startDate =(discount.ngayBatDau).toLocaleString().slice(0, 19).replace("T", " "); // Định dạng ngày bắt đầu
                    let endDate =(discount.ngayKetThuc).toLocaleString().slice(0, 19).replace("T", " "); // Định dạng ngày kết thúc

                    let giamGiaDisplay = discount.giamGia;

                    // Kiểm tra xem giá trị giảm giá có phải là phần trăm không
                    if (giamGiaDisplay.includes('%')) {
                        // Nếu có dấu % thì giữ nguyên
                        giamGiaDisplay = giamGiaDisplay;
                    } else {
                        // Nếu không có dấu % thì thêm "Đ" vào
                        function formatCurrency(amount) {
                            if (typeof amount !== 'number') amount = Number(amount); // Đảm bảo đầu vào là số
                            return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                        }
                        giamGiaDisplay = formatCurrency(giamGiaDisplay);

                    }
                    tableRows += `
                    
                   <tr>
                        <td>${index + 1}</td> <!-- Mã sản phẩm -->
                        <td>${discount.ma}</td> <!-- Mã sản phẩm -->
                        <td>${discount.ten}</td> <!-- Mã sản phẩm -->
                        <td>${now}</td> <!-- Tên sản phẩm -->
                        <td>${startDate}</td> <!-- Tên sản phẩm -->
                        <td>${endDate}</td> <!-- Tên sản phẩm -->
                        <td>${giamGiaDisplay}</td> <!-- Tên sản phẩm -->
                        <td>${discount.giaTriMin}</td> <!-- Tên sản phẩm -->
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
                });
                $('#discountTableBody').html(tableRows);
                renderPaginatio(data.totalPages, pageNumber);


            },
            error: function (xhr, status, error) {
                alert('Có lỗi xảy ra khi tải dữ liệu sản phẩm.');
            }
        });
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

    // function openEditForm(Id) {
    //     // Fetch product data by ID
    //     $.ajax({
    //         url: `http://localhost:8080/api/giamgia/discount/${Id}`,
    //         method: 'GET',
    //         success: function (discount) {
    //             // Populate form fields
    //             $('#id').val(discount.id);
    //             $('#ma').val(discount.ma);
    //             $('#ten').val(discount.ten);
    //             $('#ngaytao').val(discount.ngayTao);
    //             $('#ngaybatdau').val(discount.ngayBatDau);
    //             $('#ngayketthuc').val(discount.ngayBatDau);
    //             $('#loaigiam').val(discount.giamGia);
    //             $('#solan').val(discount.soLansd);


    //             // Show the edit modal
    //             $('#editBrandModal').modal('show');
    //         },
    //         error: function (err) {
    //             console.error("Failed to fetch product details:", err);
    //             alert("Error loading product details!");
    //         }
    //     })
    // }

    // $('#updateBrandButton').click(function (event) {
    //     if (confirm('Bạn có chắc chắn muốn sửa thương hiệu này?')) {

    //     event.preventDefault();

    //     const code = $('#ma').val().trim();
    //     const name = $('#ten').val().trim();
    //     const id = $('#id').val();

    //     if (!code || !name) {
    //         $('#maError').text(!code ? 'Mã không được để trống' : '');
    //         $('#tenError').text(!name ? 'Tên không được để trống' : '');
    //         return;
    //     }

    //     $.ajax({
    //         url: `http://localhost:8080/api/thuonghieu/${id}`,
    //         method: 'PUT',
    //         contentType: 'application/json',
    //         data: JSON.stringify({ ma: code, ten: name }),
    //         success: function () {
    //             alert("Brand updated successfully!");
    //             $('#editBrandModal').modal('hide');
    //             loadBrand(); // Refresh brand list
    //         },
    //         error: function () {
    //             alert("Error updating brand!");
    //         }
    //     });
    // }
    // });

    $('#closeButton').on('click', function () {
        $('#editBrandModal').modal('hide');
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

