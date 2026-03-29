import { useLocation, Navigate } from "react-router";
import { POST_PRICING_RATES, formatPrice } from "../data/mockData";

const CONTENT_MAP: Record<string, { title: string; content: React.ReactNode }> = {
  "/pricing": {
    title: "Bảng giá đăng tin",
    content: (
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-400">
          Hệ thống 7 Trọ cung cấp các gói đăng tin linh hoạt phù hợp với nhu cầu của chủ nhà. 
          Giá dịch vụ áp dụng từ năm 2026:
        </p>
        
        <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Thời hạn</th>
                <th className="px-4 py-3 font-semibold text-right">Chi phí</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {Object.entries(POST_PRICING_RATES).map(([key, value]) => (
                <tr key={key}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{value.label}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-bold">{formatPrice(value.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
          <p className="text-sm text-emerald-800 dark:text-emerald-400">
            <strong>Ghi chú:</strong> Bài đăng sẽ được hiển thị ngay sau khi Admin phê duyệt. 
            Bạn có thể nạp tiền vào tài khoản thông qua bộ phận CSKH hoặc chuyển khoản ngân hàng.
          </p>
        </div>
      </div>
    ),
  },
  "/guide": {
    title: "Hướng dẫn đăng tin",
    content: (
      <div className="space-y-4">
        <p>Để đăng tin cho thuê phòng trọ nhanh nhất tại 7 Trọ, bạn vui lòng tuân thủ các bước sau:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Đăng nhập vào tài khoản <strong className="text-emerald-600">Chủ nhà trọ</strong>. Nếu chưa có, hãy đăng ký.</li>
          <li>Cập nhật đầy đủ thông tin định danh (CCCD, địa chỉ thường trú) và chờ hệ thống xác duyệt.</li>
          <li>Sau khi được xác duyệt, nhấn vào "Bảng điều khiển Chủ nhà" và chọn "Đăng bài mới".</li>
          <li>Điền thông tin mô tả chi tiết, giá tiền, tiện ích và đính kèm ít nhất 3 hình ảnh rõ nét.</li>
          <li>Nhấn Gửi và chờ Admin phê duyệt nội dung bài đăng.</li>
        </ol>
      </div>
    ),
  },
  "/terms": {
    title: "Điều khoản sử dụng",
    content: (
      <div className="space-y-4">
        <p>Khi truy cập và sử dụng dịch vụ tại 7 Trọ, bạn đồng ý với các điều khoản sau:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Người sử dụng phải cam kết thông tin cung cấp (nhà trọ, danh tính) là hoàn toàn sai thật. Bất kỳ sự gian lận nào đều dẫn đến khóa tài khoản vĩnh viễn.</li>
          <li>Nền tảng 7 Trọ là trung gian môi giới kết nối, chúng tôi không chịu trách nhiệm đối với các giao dịch tài chính cá nhân giữa người thuê và người cho thuê ngoài hệ thống.</li>
          <li>Mọi hành vi spam, chèo kéo hay thu thập dữ liệu trái phép đều bị xử lý theo pháp luật hiện hành.</li>
        </ul>
      </div>
    ),
  },
  "/privacy": {
    title: "Chính sách bảo mật",
    content: (
      <div className="space-y-4">
        <p>Chính sách bảo vệ thông tin cá nhân của người dùng tại hệ thống 7 Trọ:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Thông tin định danh như CCCD, SĐT cá nhân của Chủ nhà được mã hóa và bảo mật nghiêm ngặt. Hệ thống chỉ cho phép hiển thị SĐT với những bài đăng được kiểm duyệt.</li>
          <li>Mật khẩu của bạn được mã hóa một chiều (bcrypt). Không thủ thuật, kể cả đội ngũ Admin của chúng tôi cũng không thể xem được mật khẩu thật của bạn.</li>
          <li>Khách hàng không bao giờ bị bán thông tin cá nhân cho các bên thứ ba dùng cho mục đích quảng cáo hoặc tiếp thị.</li>
        </ul>
      </div>
    ),
  },
  "/rules": {
    title: "Quy chế hoạt động",
    content: (
      <div className="space-y-4">
        <p>Quy chế hoạt động trên nền tảng thương mại điện tử 7 Trọ:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Tin đăng cần tuân thủ văn hóa phong thuần mỹ tục Việt Nam.</li>
          <li>Nghiêm cấm đăng tin phân biệt vùng miền, giới tính.</li>
          <li>Mọi tin đăng liên quan đến môi giới trung gian lấy phí phải được đánh dấu rõ ràng trong mô tả phòng trọ, cấm đăng tin mập mờ, treo đầu dê bán thịt chó.</li>
          <li>Người thuê trọ có quyền gửi báo cáo khi phát hiện chủ nhà vi phạm quy chế hoặc cung cấp sai sự thật.</li>
        </ul>
      </div>
    ),
  },
};

export function InfoPage() {
  const location = useLocation();
  const data = CONTENT_MAP[location.pathname];

  if (!data) {
    return <Navigate to="/404" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white py-12 md:py-20 text-center px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{data.title}</h1>
        <p className="text-emerald-100 max-w-2xl mx-auto">
          Các thông tin và quy định chính thức từ nền tảng 7 Trọ. 
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-2rem] md:mt-[-3rem] relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100 dark:border-gray-700">
          <div className="prose prose-emerald max-w-none dark:prose-invert text-gray-700 dark:text-gray-300">
            {data.content}
          </div>
        </div>
      </div>
    </div>
  );
}
