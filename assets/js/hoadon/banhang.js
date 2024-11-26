function addToCart(product) {
    // Lấy giỏ hàng từ localStorage (nếu có), nếu không thì khởi tạo giỏ hàng rỗng
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    let existingProductIndex = cart.findIndex(item => item.prodId === product.prodId);

    if (existingProductIndex !== -1) {
        // Nếu sản phẩm đã có trong giỏ, tăng số lượng lên 1
        cart[existingProductIndex].quantity += 1;
    } else {
        // Nếu chưa có, thêm sản phẩm mới vào giỏ
        cart.push(product);
    }

    // Lưu giỏ hàng lại vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Cập nhật giỏ hàng trên giao diện
    renderCart();
    updateTotalAmount()
}

// Hàm hiển thị giỏ hàng
function renderCart() {
    // Lấy giỏ hàng từ localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Tạo nội dung giỏ hàng
    let cartItemsHtml = cart.map(product => {
        // Định dạng giá của sản phẩm và tổng tiền cho sản phẩm
        const formattedPrice = product.price.toLocaleString('vi-VN');
        const formattedTotal = (product.price * product.quantity).toLocaleString('vi-VN');
        
        return `
            <tr>
                <td>${product.prodName}</td>
                <td>${product.quantity}</td>
                <td>${formattedPrice} VND</td>
                <td>${formattedTotal} VND</td>
                <td><button onclick="removeFromCart('${product.prodId}')">Xóa</button></td>
            </tr>
        `;
    }).join('');

    // Hiển thị giỏ hàng lên giao diện
    document.getElementById('cartItems').innerHTML = cartItemsHtml;

    // Cập nhật tổng tiền giỏ hàng
    updateTotalAmount();
}

$(document).ready(function () {
    // Xử lý nút "Thanh toán"
    $('#checkoutBtn').click(function (e) {
        e.preventDefault();

        // Thu thập thông tin khách hàng từ form
        const customerName = $('#customerName').val().trim();
        const customerPhone = $('#customerPhone').val().trim();

        if (!customerName || !customerPhone) {
            alert('Vui lòng nhập đầy đủ thông tin khách hàng!');
            return;
        }

        // Lấy giỏ hàng từ localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }

        // Tính tổng tiền
        const totalAmount = cart.reduce((total, product) => total + (product.price * product.quantity), 0);

        // Lấy giá trị giảm giá và tính tổng sau giảm
        const discount = parseFloat($('#discountSelect').val()|| 0);
        const finalAmount = totalAmount - (totalAmount * discount / 100);



        // Chuẩn bị dữ liệu để gửi đến API
        const invoiceData = {
            nguoiDung: {
                hoTen: customerName,
                sdt: customerPhone
            },
            sanPhamList: cart.map(product => ({
                idSanPham: product.prodId,
                ten: product.prodName,// ID sản phẩm
                soLuong: product.quantity,
                donGia: product.price
            })),
            tongTien: totalAmount,
            tienThu: finalAmount,
            tienGiam: totalAmount - finalAmount,
            // maGiamGia: discount,  // Mã giảm giá nếu có
            ghiChu: "InStore"
        };

        // Gửi yêu cầu tạo hóa đơn và thanh toán
        $.ajax({
            url: 'http://127.0.0.1:8080/api/datdon/taiquay', // Thay bằng URL của bạn
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(invoiceData),
            success: function (response) {
                alert('Thanh toán thành công!');
                console.log('Kết quả thanh toán:', response);

                // Xóa giỏ hàng và làm mới giao diện
                localStorage.removeItem('cart');
                $('#cartItems').empty();
                $('#totalAmount').text('0 VND');
                $('#finalAmount').text('0 VND');
                $('#customerForm')[0].reset(); // Đặt lại toàn bộ form


            },
            error: function (xhr, status, error) {
                console.error('Lỗi khi thanh toán:', error);
                alert('Có lỗi xảy ra khi thanh toán.');
            }
        });
    });
});

function updateTotalAmount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Tính tổng tiền giỏ hàng
    let totalAmount = cart.reduce((total, product) => total + (product.price * product.quantity), 0);
    
    // Lấy giá trị giảm giá từ dropdown
    const discountPercentage = parseFloat(document.getElementById('discountSelect').value) || 0;

    // Tính tổng tiền sau giảm giá
    const discountAmount = (totalAmount * discountPercentage) / 100;
    const finalAmount = totalAmount - discountAmount;

    // Định dạng số tiền
    const formattedTotalAmount = totalAmount.toLocaleString('vi-VN');
    const formattedFinalAmount = finalAmount.toLocaleString('vi-VN');

    // Cập nhật giao diện
    document.getElementById('totalAmount').textContent = `${formattedTotalAmount} VND`; // Tổng tiền gốc
    document.getElementById('finalAmount').textContent = `${formattedFinalAmount} VND`; // Tổng sau giảm
}

function loadDiscounts() {
    $.ajax({
        url: 'http://127.0.0.1:8080/api/giamgia', // Thay bằng URL API thực tế
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            console.log("Danh sách giảm giá:", response);
            
            // Lấy phần tử dropdown "Giảm giá"
            const discountSelect = $('#discountSelect');

            // Xóa các option cũ (nếu có)
            discountSelect.empty();

            // Thêm lựa chọn mặc định
            discountSelect.append('<option value="0">Không giảm giá</option>');

            // Thêm các tùy chọn giảm giá từ API
            response.forEach(discount => {
                // discountSelect.append(`<option value="${discount.ten}">Giảm ${discount.giamGia}</option>`);
                const value = discount.giamGia.replace('%', '').trim(); // Lấy giá trị giảm giá
                const option = `<option value="${value}">${discount.ten} - ${discount.giamGia}</option>`;
                discountSelect.append(option);
            });

            // Gán sự kiện khi thay đổi mức giảm giá
            discountSelect.change(updateTotalAmount);
        },
        error: function (xhr, status, error) {
            console.error('Lỗi khi lấy danh sách giảm giá:', error);
        }
    });
}

loadDiscounts()

// Hàm xóa sản phẩm khỏi giỏ hàng
function removeFromCart(prodId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Lọc ra sản phẩm không phải có prodId cần xóa
    cart = cart.filter(product => product.prodId !== prodId);
    
    // Lưu giỏ hàng mới vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Cập nhật giỏ hàng trên giao diện
    renderCart();
}

// Hàm khởi tạo giỏ hàng khi trang được tải
function initCart() {
    renderCart();  // Hiển thị giỏ hàng lên giao diện ngay khi trang được tải
}

// Gọi hàm khởi tạo giỏ hàng khi trang tải
window.onload = initCart;


function displayProducts(pageNumber = 1) {
    const paramData = {
        search: $("#searchInput").val(),  // Từ khóa tìm kiếm
        sortOrder: "asc",  // Sắp xếp theo thứ tự tăng dần
        pageSize: 12,      // Số sản phẩm mỗi trang
        pageNumber: pageNumber - 1 // Trang hiện tại (API yêu cầu pageNumber bắt đầu từ 0)
    };

    const productList = $("#productList");  // Phần tử chứa danh sách sản phẩm
    const paginationContainer = $("#paginationContainer");  // Phần tử chứa phân trang

    $.support.cors = true;
    $.ajax({
        url: 'http://127.0.0.1:8080/api/sanpham', // Đường dẫn API
        type: 'GET',
        dataType: 'json',
        data: paramData,
        success: function (response) {
            console.log("Response from API:", response);  // Kiểm tra response từ API

            // Xóa danh sách sản phẩm hiện tại trước khi thêm mới
            $(productList).empty();

            if (response.content.length === 0) {
                console.log("No products found.");
                // updateProductCount(response.content.length);  // Cập nhật số lượng sản phẩm
                return; // Không làm gì nếu không có sản phẩm
            }

            // Tính tổng số sản phẩm
            // updateProductCount(response.content.length);
            updatePagination(response.totalPages, pageNumber); // Cập nhật phân trang

            // Xây dựng toàn bộ HTML cho tất cả sản phẩm
            $.each(response.content, function (index, product) {
                var productHtml = buildProductHtml(product);  // Xây dựng HTML cho mỗi sản phẩm
                $(productList).append(productHtml);  // Thêm sản phẩm vào danh sách
            });
        },
        error: function (xhr, status, error) {
            console.error('Error retrieving products:', error);
        }
    });
}

function buildProductHtml(product) {
    const formattedPrice = product.giaBan.toLocaleString('vi-VN');

    return `
        <div class="col-md-3 mb-3">
            <div class="card" style="width: 100%; max-width: 200px;">
                <img src="/assets/${product.anh}" class="card-img-top"  style="width: 100%; height: auto; max-height: 150px; object-fit: cover;">
                <div class="card-body p-2">
                    <h6 class="card-title" style="font-size: 0.9rem;">${product.tenSP}</h6>
                    <p class="card-text" style="font-size: 0.8rem;">Giá: ${formattedPrice} VND</p> <!-- Hiển thị giá đã được định dạng -->
                    <p class="card-text" style="font-size: 0.8rem;">Thương hiệu: ${product.thuongHieu.ten}</p>
                    <p class="card-text" style="font-size: 0.8rem;">Màu sắc: ${product.mauSac.ten}</p>
                    <button class="btn btn-primary btn-sm" onclick="addToCart({
                        prodId: '${product.idSP}', 
                        prodName: '${product.tenSP}', 
                        price: ${product.giaBan}, 
                        quantity: 1
                    })">Thêm vào giỏ</button>
                </div>
            </div>
        </div>
    `;
}

// Hàm cập nhật phân trang
function updatePagination(totalPages, currentPage) {
    const paginationContainer = $("#paginationContainer");
    paginationContainer.empty();  // Xóa các phân trang cũ

    if (totalPages > 1) {
        let paginationHtml = '<nav aria-label="Page navigation"><ul class="pagination justify-content-center">';

        // Nút Previous
        if (currentPage > 1) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" id="previousPage" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
            `;
        }

        // Các số trang
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>
                </li>
            `;
        }

        // Nút Next
        if (currentPage < totalPages) {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" id="nextPage" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            `;
        }

        paginationHtml += '</ul></nav>';
        paginationContainer.html(paginationHtml);

        // Sự kiện cho nút Previous
        $('#previousPage').on('click', function () {
            if (currentPage > 1) {
                goToPage(currentPage - 1);
            }
        });

        // Sự kiện cho nút Next
        $('#nextPage').on('click', function () {
            if (currentPage < totalPages) {
                goToPage(currentPage + 1); // Lấy trang tiếp theo
            }
        });
    }
}

// Hàm chuyển đến trang mới
function goToPage(pageNumber) {
    displayProducts(pageNumber);  // Gọi lại hàm để tải sản phẩm của trang mới
}

// Hàm tìm kiếm sản phẩm
$("#searchInput").on("input", function () {
    displayProducts(1); // Mỗi khi người dùng nhập tìm kiếm, tải lại từ trang 1
});

// Gọi hàm hiển thị sản phẩm lần đầu
displayProducts(1);

