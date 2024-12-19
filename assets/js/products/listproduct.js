$(document).ready(function () {
    // const role = localStorage.getItem('role');  // Lấy role từ localStorage

    // Hàm tải dữ liệu người dùng từ API
    function loadProductData(pageNumber = 0) {
        $.ajax({
            url: `http://localhost:8080/api/loginAuth/product?page=${pageNumber}`,
            type: 'GET',
            success: function (data) {
                let tableRows = '';
                data.content.forEach(function (product, index) {
                    tableRows += `
                    
                   <tr>
                        <td>${index + 1}</td> <!-- Mã sản phẩm -->
                        <td>${product.maSP}</td> <!-- Mã sản phẩm -->
                        <td>${product.tenSP}</td> <!-- Tên sản phẩm -->
                        <td>${product.thuongHieuTen}</td> <!-- Tên thương hiệu -->
                        <td>${product.mauSacTen}</td> <!-- Tên màu sắc -->
                        <td>${product.theLoaiTen}</td> <!-- Tên thể loại -->
                        <td>${product.xuatXuTen}</td> <!-- Tên xuất xứ -->
                        <td>${product.chatLieuTen}</td> <!-- Tên chất liệu -->
                        <td>${product.sizeTen}</td> <!-- Tên size -->
                        <td>${product.soLuongTon}</td> <!-- Số lượng tồn -->
                        <td>${formatCurrency(product.giaBan)}</td> <!-- Số lượng tồn -->
                        <td>${product.moTa}</td> <!-- Mô tả sản phẩm -->
                        <td><img src="/assets/${product.anh}" width="50" height="50" /></td>
                        <td>
                            <!-- Trạng thái sản phẩm: ON/OFF -->
                            <i class="fas fa-toggle-${product.trangThai ? 'on' : 'off'} status-toggle" data-id="${product.id}" style="font-size: 24px; color: ${product.trangThai ? 'green' : 'gray'};"></i>
                        </td>
                        <td class="text-end">
                            <button class="btn btn-outline-info btn-rounded" data-id="${product.id}"><i class="fas fa-pen"></i> Edit</button>
                            <button class="btn btn-outline-danger btn-rounded" data-id="${product.id}"><i class="fas fa-trash"></i> Delete</button>
                        </td>
                    </tr>
                    `;
                });
                $('#productsTableBody').html(tableRows);
                registerStatusToggle();
                renderPagination(data.totalPages, pageNumber);

                // <td>${product.id}</td> <!-- ID sản phẩm -->
            },
            error: function (xhr, status, error) {
                alert('Có lỗi xảy ra khi tải dữ liệu sản phẩm.');
            }
        });
    }

    function formatCurrency(amount) {
        if (typeof amount !== 'number') amount = Number(amount); // Đảm bảo đầu vào là số
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    function renderPagination(totalPages, currentPage) {
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
        loadProductData(pageNumber);  // Tải dữ liệu của trang tương ứng
    });



    // Tải dữ liệu sản phẩm lần đầu tiên
    loadProductData();



    // Hàm đăng ký sự kiện click cho các icon trạng thái
    function registerStatusToggle() {
        $('.status-toggle').click(function () {
            var icon = $(this);  // Lưu đối tượng icon vào một biến
            var productId = icon.data('id');  // Lấy userId từ thuộc tính data-id
            console.log("Mã sản phẩm:", productId); // Kiểm tra giá trị của userId

            var currentStatus = icon.hasClass('fa-toggle-on');  // Kiểm tra trạng thái hiện tại (đang bật hay tắt)
            var newStatus = !currentStatus;  // Đảo trạng thái

            if (!confirm(`Bạn có chắc chắn muốn ${newStatus ? 'bật' : 'tắt'} trạng thái của Sản phẩm này?`)) {
                return;  // Nếu người dùng không xác nhận, dừng hành động
            }

            // Kiểm tra xem userId có phải là UUID hợp lệ không
            if (!isValidUUID(productId)) {
                alert("Mã sản phẩm không hợp lệ.");
                return;
            }

            // Gửi yêu cầu PUT để cập nhật trạng thái
            $.ajax({
                url: `http://localhost:8080/api/loginAuth/upStatusProduct/${productId}?trangThai=${newStatus}`,
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
    $('#productsTableBody').on('click', '.btn-outline-info', function () {
        const productId = $(this).data('id');
        openEditForm(productId);
    });

    $('#productsTableBody').on('click', '.btn-outline-danger', function () {
        const productId = $(this).data('id');
        deleteProduct(productId);
    });



    // Hàm xóa tài khoản người dùng
    function deleteProduct(productId) {
        if (confirm('Bạn có chắc chắn muốn xóa Sản Phẩm này?')) {
            // Gửi yêu cầu xóa tài khoản người dùng
            $.ajax({
                url: `http://localhost:8080/api/loginAuth/deleteProduct/${productId}`,  // API xóa người dùng
                type: 'DELETE',
                success: function (response) {
                    alert('Product deleted successfully!');
                    loadProductData();  // Tải lại danh sách người dùng sau khi xóa
                },
                error: function () {
                    alert('Có lỗi xảy ra khi xóa người dùng.');
                }
            });
        }
    }


    //add Sản phẩm
    // Function để load dữ liệu thuộc tính



    // loadProductAttributes(); // Load dữ liệu thuộc tính
    saveProduct();

    $(document).ready(function () {
        // Gọi API để lấy dữ liệu thuộc tính
        $.ajax({
            url: 'http://localhost:8080/api/products/attributes?brands=true&colors=true&materials=true&origins=true&categories=true&sizes=true',
            method: 'GET',
            success: function (response) {
                console.log(response);  // Kiểm tra dữ liệu trả về
                // Cập nhật danh sách thương hiệu
                $('#brand').empty();
                $('#brand').append(new Option("Chọn thương hiệu", ""));
                response.brands.forEach(function (brand) {
                    console.log(brand);
                    $('#brand').append(new Option(brand.ten, brand.id));
                });

                // Cập nhật danh sách màu sắc
                $('#color').empty();
                $('#color').append(new Option("Chọn màu sắc", ""));
                response.colors.forEach(function (color) {
                    $('#color').append(new Option(color.ten, color.id));
                });

                // Cập nhật danh sách chất liệu
                $('#material').empty();
                $('#material').append(new Option("Chọn chất liệu", ""));
                response.materials.forEach(function (material) {
                    $('#material').append(new Option(material.ten, material.id));
                });

                // Cập nhật danh sách xuất xứ
                $('#origin').empty();
                $('#origin').append(new Option("Chọn xuất xứ", ""));
                response.origins.forEach(function (origin) {
                    $('#origin').append(new Option(origin.ten, origin.id));
                });

                // Cập nhật danh sách thể loại
                $('#category').empty();
                $('#category').append(new Option("Chọn thể loại", ""));
                response.categories.forEach(function (category) {
                    $('#category').append(new Option(category.ten, category.id));
                });

                // Cập nhật danh sách size
                $('#size').empty();
                $('#size').append(new Option("Chọn size", ""));
                response.sizes.forEach(function (size) {
                    $('#size').append(new Option(size.ten, size.id));
                });


            },
            error: function (err) {
                console.error("Lỗi khi gọi API:", err);
            }
        });


    });

    function openEditForm(productId) {
        // Fetch product data by ID
        $.ajax({
            url: `http://localhost:8080/api/products/${productId}`,
            method: 'GET',
            success: function (product) {
                // Populate form fields
                $('#productId').val(product.id);
                $('#productCode').val(product.maSP);
                $('#productName').val(product.tenSP);
                $('#brand').val(product.thuongHieuId);
                $('#color').val(product.mauSacId);
                $('#material').val(product.chatLieuId);
                $('#origin').val(product.xuatXuId);
                $('#category').val(product.theLoaiId);
                $('#size').val(product.sizeId);
                $('#price').val(product.giaBan);
                $('#stock').val(product.soLuongTon);
                $('#description').val(product.moTa);
                $('#imagePath').val(product.anh); // Đường dẫn ảnh

                $('#status').prop('checked', product.trangThai);

                // Show the edit modal
                $('#editProductModal').modal('show');
            },
            error: function (err) {
                console.error("Failed to fetch product details:", err);
                alert("Error loading product details!");
            }
        })
    }

    $('#updateProductButton').on('click', function (event) {
        event.preventDefault();

        $('span[id$="Error"]').text('');

        // Kiểm tra các trường bắt buộc
        var isValid = true;

        // Kiểm tra Mã sản phẩm
        //  if ($('#productCode').val() === '') {
        //      $('#maSPError').text('Mã sản phẩm không được để trống');
        //      isValid = false;
        //  }

        // Kiểm tra Tên sản phẩm
        if ($('#productName').val() === '') {
            $('#nameSPError').text('Tên sản phẩm không được để trống');
            isValid = false;
        }

        // Kiểm tra Thương hiệu
        if ($('#brand').val() === '') {
            $('#brandError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Màu sắc
        if ($('#color').val() === '') {
            $('#colorError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Chất liệu
        if ($('#material').val() === '') {
            $('#materialError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Xuất xứ
        if ($('#origin').val() === '') {
            $('#originError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Thể loại
        if ($('#category').val() === '') {
            $('#categoryError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Size
        if ($('#size').val() === '') {
            $('#sizeError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Tồn kho
        var stockValue = $('#stock').val();
        if (stockValue === '' || parseInt(stockValue) < 0) {
            $('#stockError').text('Tồn kho không được để trống và phải là số không âm');
            isValid = false;
        }

        // Kiểm tra Giá bán
        var priceValue = $('#price').val();
        if (priceValue === '' || parseFloat(priceValue) < 0) {
            $('#priceError').text('Giá bán không được để trống và phải là số không âm');
            isValid = false;
        }


        // Nếu có lỗi, không gửi dữ liệu
        if (!isValid) {
            return; // Dừng lại không gửi dữ liệu
        }

        const productData = new FormData($('#editProductForm')[0]);
        const productId = $('#productId').val(); // ID from hidden input

        $.ajax({
            url: `http://localhost:8080/api/products/update/${productId}`,
            method: 'PUT',
            data: productData,
            contentType: false,
            processData: false,
            success: function (response) {
                alert("Product updated successfully!");
                // $('#editProductModal').modal('hide');
                $('#editProductModal').removeClass('show').addClass('fade');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
                loadProductData();
            },
            error: function (err) {
                console.error("Error updating product:", err);
                alert("Error updating product!");
            }
        });
    });

    $('#closeButton').on('click', function () {
        $('#editProductModal').modal('hide');
        // });
    });
});

function loadProductAttributes() {
    $.ajax({
        url: 'http://localhost:8080/api/products/attributes?brands=true&colors=true&materials=true&origins=true&categories=true&sizes=true',
        method: 'GET',
        success: function (response) {
            console.log(response); // Kiểm tra dữ liệu trả về

            // Cập nhật danh sách thương hiệu
            $('#thuonghieu').empty().append(new Option("Chọn thương hiệu", ""));
            response.brands.forEach(function (brand) {
                $('#thuonghieu').append(new Option(brand.ten, brand.id));
            });

            // Cập nhật danh sách màu sắc
            $('#mausac').empty().append(new Option("Chọn màu sắc", ""));
            response.colors.forEach(function (color) {
                $('#mausac').append(new Option(color.ten, color.id));
            });

            // Cập nhật danh sách chất liệu
            $('#chatlieu').empty().append(new Option("Chọn chất liệu", ""));
            response.materials.forEach(function (material) {
                $('#chatlieu').append(new Option(material.ten, material.id));
            });

            // Cập nhật danh sách xuất xứ
            $('#xuatxu').empty().append(new Option("Chọn xuất xứ", ""));
            response.origins.forEach(function (origin) {
                $('#xuatxu').append(new Option(origin.ten, origin.id));
            });

            // Cập nhật danh sách thể loại
            $('#theloai').empty().append(new Option("Chọn thể loại", ""));
            response.categories.forEach(function (category) {
                $('#theloai').append(new Option(category.ten, category.id));
            });

            // Cập nhật danh sách size
            $('#kichco').empty().append(new Option("Chọn size", ""));
            response.sizes.forEach(function (size) {
                $('#kichco').append(new Option(size.ten, size.id));
            });
        },
        error: function (err) {
            console.error("Lỗi khi gọi API:", err);
        }
    });
}

// Function để xử lý lưu sản phẩm
function saveProduct() {
    $('#saveProductButton').on('click', function (event) {
        event.preventDefault(); // Ngừng reload trang khi submit
        console.log('Save button clicked'); // Log khi nút được nhấn

        // Reset các lỗi cũ
        $('span[id$="Error"]').text('');

        // Kiểm tra các trường bắt buộc
        var isValid = true;
        if ($('#ten').val() === '') {
            $('#tenSPError').text('Tên sản phẩm không được để trống');
            isValid = false;
        }

        // Kiểm tra Thương hiệu
        if ($('#thuonghieu').val() === '') {
            $('#thuonghieuError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Màu sắc
        if ($('#mausac').val() === '') {
            $('#mausacError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Chất liệu
        if ($('#chatlieu').val() === '') {
            $('#chatlieuError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Xuất xứ
        if ($('#xuatxu').val() === '') {
            $('#xuatxuError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Thể loại
        if ($('#theloai').val() === '') {
            $('#theloaiError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Size
        if ($('#kichco').val() === '') {
            $('#kichcoError').text('Vui lòng chọn ');
            isValid = false;
        }

        // Kiểm tra Tồn kho
        var stockValue = $('#tonkho').val();
        if (stockValue === '' || parseInt(stockValue) < 0) {
            $('#tonkhoError').text('Tồn kho không được để trống và phải là số không âm');
            isValid = false;
        }

        // Kiểm tra Giá bán
        var priceValue = $('#gia').val();
        if (priceValue === '' || parseFloat(priceValue) < 0) {
            $('#giaError').text('Giá bán không được để trống và phải là số không âm');
            isValid = false;
        }

        // Nếu có lỗi, không gửi dữ liệu
        if (!isValid) return;

        // Thu thập dữ liệu từ form
        var formData = new FormData($('#addProductForm')[0]);
        console.log(formData); // Log formData để kiểm tra

        // Gửi dữ liệu qua AJAX để thêm sản phẩm
        $.ajax({
            url: 'http://localhost:8080/api/products/add', // Đường dẫn API
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log(response);
                alert('Product added successfully!');
                $('#addProductModal').removeClass('show').addClass('fade');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
                $('#addProductForm')[0].reset(); // Reset form
                // loadProductData(); // Reload lại bảng sản phẩm
                window.location.reload();
            },
            error: function (err) {
                alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
                console.error(err);
            }
        });
    });
}


$(document).ready(function () {
    $('#saveBrandBtn').click(function () {

        var code = $('#brandCode').val();
        var name = $('#brandName').val();

        if (!name) {
            // $('#codeError').text(!code ? 'Mã không được để trống' : '');
            $('#nameError').text(!name ? 'Tên không được để trống' : '');
            return;
        }
        if (confirm('Bạn có chắc chắn muốn thêm thương hiệu này?')) {

            // Gửi AJAX để lưu thương hiệu
            $.ajax({
                url: 'http://localhost:8080/api/thuonghieu',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ ma: code, ten: name }),
                success: function (response) {
                    alert("Brand added successfully!");
                    loadProductAttributes();
                    $('#addBrandForm')[0].reset(); // Reset form
                    $('#addBrandModal').css('display', 'none');
                    $('.modal-backdrop').remove(); // Xóa backdrop nếu có

                },
                error: function (xhr) {
                    if (xhr.status === 400 && xhr.responseJSON) { // Lỗi do backend trả về
                        $('#nameError').text(xhr.responseJSON.message || 'Tên thương hiệu đã tồn tại!');
                    } else {
                        alert("Thêm thương hiệu thất bại!");
                    }
                    // alert("Thêm thương hiệu thất bại!");
                }
            });
        }
    });

    $('#saveColorBtn').click(function () {

        var code = $('#colorCode').val();
        var name = $('#colorName').val();

        if (!name) {
            // $('#codeError').text(!code ? 'Mã không được để trống' : '');
            $('#nameColorError').text(!name ? 'Tên không được để trống' : '');
            return;
        }
        if (confirm('Bạn có chắc chắn muốn thêm mới?')) {

            // Gửi AJAX để lưu thương hiệu
            $.ajax({
                url: 'http://localhost:8080/api/mausac',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ ma: code, ten: name }),
                success: function (response) {
                    alert("Color added successfully!");
                    loadProductAttributes();
                    $('#addColorForm')[0].reset(); // Reset form
                    $('#addColorModal').css('display', 'none');
                    $('.modal-backdrop').remove(); // Xóa backdrop nếu có

                },
                error: function (xhr) {
                    if (xhr.status === 400 && xhr.responseJSON) { // Lỗi do backend trả về
                        $('#nameColorError').text(xhr.responseJSON.message || 'Tên đã tồn tại!');
                    } else {
                        alert("Thêm thất bại!");
                    }
                    // alert("Thêm thương hiệu thất bại!");
                }
            });
        }
    });

    $('#saveMaterialBtn').click(function () {

        var code = $('#materialCode').val();
        var name = $('#materialName').val();

        if (!name) {
            // $('#codeError').text(!code ? 'Mã không được để trống' : '');
            $('#nameMaterialError').text(!name ? 'Tên không được để trống' : '');
            return;
        }
        if (confirm('Bạn có chắc chắn muốn thêm mới?')) {

            // Gửi AJAX để lưu thương hiệu
            $.ajax({
                url: 'http://localhost:8080/api/chatlieu',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ ma: code, ten: name }),
                success: function (response) {
                    alert("Material added successfully!");
                    loadProductAttributes();
                    $('#addMaterialForm')[0].reset(); // Reset form
                    $('#addMaterialModal').css('display', 'none');
                    $('.modal-backdrop').remove(); // Xóa backdrop nếu có

                },
                error: function (xhr) {
                    if (xhr.status === 400 && xhr.responseJSON) { // Lỗi do backend trả về
                        $('#nameMaterialError').text(xhr.responseJSON.message || 'Tên đã tồn tại!');
                    } else {
                        alert("Thêm thất bại!");
                    }
                    // alert("Thêm thương hiệu thất bại!");
                }
            });
        }
    });

    $('#saveOriginBtn').click(function () {

        var code = $('#originCode').val();
        var name = $('#originName').val();

        if (!name) {
            // $('#codeError').text(!code ? 'Mã không được để trống' : '');
            $('#nameOriginError').text(!name ? 'Tên không được để trống' : '');
            return;
        }
        if (confirm('Bạn có chắc chắn muốn thêm mới?')) {

            $.ajax({
                url: 'http://localhost:8080/api/xuatxu',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ ma: code, ten: name }),
                success: function (response) {
                    alert("Origin added successfully!");
                    loadProductAttributes();
                    $('#addOriginForm')[0].reset(); // Reset form
                    $('#addOriginModal').css('display', 'none');
                    $('.modal-backdrop').remove(); // Xóa backdrop nếu có

                },
                error: function (xhr) {
                    if (xhr.status === 400 && xhr.responseJSON) { // Lỗi do backend trả về
                        $('#nameOriginError').text(xhr.responseJSON.message || 'Tên đã tồn tại!');
                    } else {
                        alert("Thêm thất bại!");
                    }
                    // alert("Thêm thương hiệu thất bại!");
                }
            });
        }
    });

    $('#saveCategoryBtn').click(function () {

        var code = $('#categoryCode').val();
        var name = $('#categoryName').val();

        if (!name) {
            // $('#codeError').text(!code ? 'Mã không được để trống' : '');
            $('#nameCategoryError').text(!name ? 'Tên không được để trống' : '');
            return;
        }
        if (confirm('Bạn có chắc chắn muốn thêm mới?')) {

            // Gửi AJAX để lưu thương hiệu
            $.ajax({
                url: 'http://localhost:8080/api/theloai',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ ma: code, ten: name }),
                success: function (response) {
                    alert("Category added successfully!");
                    loadProductAttributes();
                    $('#addCategoryForm')[0].reset(); // Reset form
                    $('#addCategoryModal').css('display', 'none');
                    $('.modal-backdrop').remove(); // Xóa backdrop nếu có

                },
                error: function (xhr) {
                    if (xhr.status === 400 && xhr.responseJSON) { // Lỗi do backend trả về
                        $('#nameCategoryError').text(xhr.responseJSON.message || 'Tên đã tồn tại!');
                    } else {
                        alert("Thêm thất bại!");
                    }
                    // alert("Thêm thương hiệu thất bại!");
                }
            });
        }
    });

    $('#saveSizeBtn').click(function () {

        var code = $('#sizeCode').val();
        var name = $('#sizeName').val();

        if (!name) {
            // $('#codeError').text(!code ? 'Mã không được để trống' : '');
            $('#nameSizeError').text(!name ? 'Tên không được để trống' : '');
            return;
        }
        if (confirm('Bạn có chắc chắn muốn thêm mới?')) {

            // Gửi AJAX để lưu thương hiệu
            $.ajax({
                url: 'http://localhost:8080/api/size',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ ma: code, ten: name }),
                success: function (response) {
                    alert("Color added successfully!");
                    loadProductAttributes();
                    $('#addSizeForm')[0].reset(); // Reset form
                    $('#addSizeModal').css('display', 'none');
                    $('.modal-backdrop').remove(); // Xóa backdrop nếu có

                },
                error: function (xhr) {
                    if (xhr.status === 400 && xhr.responseJSON) { // Lỗi do backend trả về
                        $('#nameSizeError').text(xhr.responseJSON.message || 'Tên đã tồn tại!');
                    } else {
                        alert("Thêm thất bại!");
                    }
                    // alert("Thêm thương hiệu thất bại!");
                }
            });
        }
    });


});


