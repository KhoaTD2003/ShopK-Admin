$(document).ready(function () {

    function loadBrand(pageNumber = 0) {
        $.ajax({
            url: `http://127.0.0.1:8080/api/mausac/page?pageNumber=${pageNumber}`, // Đường dẫn API có hỗ trợ sắp xếp
            type: 'GET',
            success: function (data) {
                let tableRows = '';
                data.content.forEach(function (brand, index) {
                    tableRows += `
                    
                   <tr>
                        <td>${index + 1}</td> <!-- Mã sản phẩm -->
                        <td>${brand.id}</td> <!-- Mã sản phẩm -->
                        <td>${brand.ma}</td> <!-- Mã sản phẩm -->
                        <td>${brand.ten}</td> <!-- Tên sản phẩm -->
                         <td>
                            <button class="btn btn-outline-info btn-rounded" data-id="${brand.id}"><i class="fas fa-pen"></i> Edit</button>
                            <button class="btn btn-outline-danger btn-rounded" data-id="${brand.id}"><i class="fas fa-trash"></i> Delete</button>
                        </td>
                    </tr>
                    `;
                });
                $('#brandTableBody').html(tableRows);
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
        loadBrand(pageNumber);  // Tải dữ liệu của trang tương ứng
    });


    loadBrand();


    $('#brandTableBody').on('click', '.btn-outline-info', function () {
        const Id = $(this).data('id');
        openEditForm(Id);
    });

    $('#brandTableBody').on('click', '.btn-outline-danger', function () {
        const Id = $(this).data('id');
        deleteProduct(Id);
    });

    function deleteProduct(Id) {
        if (confirm('Bạn có chắc chắn muốn xóa Sản Phẩm này?')) {
            // Gửi yêu cầu xóa tài khoản người dùng
            $.ajax({
                url: `http://localhost:8080/api/mausac/${Id}`,  // API xóa người dùng
                type: 'DELETE',
                success: function (response) {
                    alert('Brand deleted successfully!');
                    loadBrand();  // Tải lại danh sách người dùng sau khi xóa
                },
                error: function () {
                    alert('Có lỗi xảy ra khi xóa người dùng.');
                }
            });
        }
    }

    function openEditForm(Id) {
        // Fetch product data by ID
        $.ajax({
            url: `http://localhost:8080/api/mausac/${Id}`,
            method: 'GET',
            success: function (product) {
                // Populate form fields
                $('#id').val(product.id);
                $('#ma').val(product.ma);
                $('#ten').val(product.ten);

                // Show the edit modal
                $('#editBrandModal').modal('show');
            },
            error: function (err) {
                console.error("Failed to fetch product details:", err);
                alert("Error loading product details!");
            }
        })
    }

    $('#updateBrandButton').click(function (event) {
        if (confirm('Bạn có chắc chắn muốn sửa thương hiệu này?')) {

        event.preventDefault();

        const code = $('#ma').val().trim();
        const name = $('#ten').val().trim();
        const id = $('#id').val();

        if (!code || !name) {
            $('#maError').text(!code ? 'Mã không được để trống' : '');
            $('#tenError').text(!name ? 'Tên không được để trống' : '');
            return;
        }

        $.ajax({
            url: `http://localhost:8080/api/mausac/${id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ ma: code, ten: name }),
            success: function () {
                alert("Brand updated successfully!");
                $('#editBrandModal').modal('hide');
                loadBrand(); // Refresh brand list
            },
            error: function () {
                alert("Error updating brand!");
            }
        });
    }
    });

    $('#closeButton').on('click', function () {
        $('#editBrandModal').modal('hide');
        // });
    });

    $('#addBrandButton').click(function (event) {
        event.preventDefault();

        // Lấy dữ liệu từ form
        const code = $('#Code').val().trim();
        const name = $('#Name').val().trim();


        if (!name) {
            // $('#codeError').text(!code ? 'Mã không được để trống' : '');
            $('#nameError').text(!name ? 'Tên không được để trống' : '');
            return;
        }
        if (confirm('Bạn có chắc chắn muốn thêm thương hiệu này?')) {

        // Gửi yêu cầu thêm thương hiệu
        $.ajax({
            url: 'http://localhost:8080/api/mausac',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ ma: code, ten: name }),
            success: function () {
                alert("Brand added successfully!");
                // $('#addBrandModal').modal('hide');
                 $('#addBrandForm')[0].reset(); // Reset form
                 window.location.reload();
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

})

