import React, { useState } from "react";
import { Switch } from "antd";
import { UpdateProductAvailabilityOnlyAPI } from "../../serviceAPI/productApi";
import toast from "react-hot-toast";
import "./ProductAvailabilityToggle.css";

const ProductAvailabilityToggle = ({ product, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(product.available === true);

  const handleToggle = async (checked) => {
    setLoading(true);
    try {
      console.log(
        `Thay đổi trạng thái sản phẩm ${product.id} thành ${
          checked ? "có sẵn" : "hết hàng"
        }`
      );

      // Gọi API để cập nhật trạng thái
      const response = await UpdateProductAvailabilityOnlyAPI(
        product.id,
        checked
      );

      console.log("Kết quả cập nhật:", response);

      // Cập nhật state local
      setAvailable(checked);

      // Thông báo thành công
      toast.success(
        `Đã chuyển "${product.name}" sang trạng thái ${
          checked ? "có sẵn" : "hết hàng"
        }`
      );

      // Gọi callback để cập nhật UI cha nếu cần
      if (onStatusChange) {
        onStatusChange(product.id, checked);
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      toast.error(
        `Không thể thay đổi trạng thái: ${
          error.message || "Lỗi không xác định"
        }`
      );
      // Khôi phục trạng thái cũ nếu có lỗi
      setAvailable(product.available === true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-availability-toggle">
      <Switch
        checked={available}
        onChange={handleToggle}
        loading={loading}
        className={available ? "switch-available" : "switch-unavailable"}
      />
      <span
        className={`status-label ${available ? "available" : "unavailable"}`}
      >
        {available ? "Có sẵn" : "Hết hàng"}
      </span>
    </div>
  );
};

export default ProductAvailabilityToggle;
