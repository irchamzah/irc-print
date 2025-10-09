export default function AboutPage() {
  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Tentang IRC Print
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Layanan print online 24 jam untuk kebutuhan cetak dokumen dadakan
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Vision */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Visi Kami
            </h3>
            <p className="text-gray-600">
              Menjadi platform print online 24 jam yang memudahkan masyarakat
              dalam mencetak dokumen dadakan.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Misi Kami
            </h3>
            <p className="text-gray-600">
              Menyediakan layanan print yang terjangkau, dan mudah diakses.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Keunggulan Kami
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "⚡",
                title: "Cepat",
                desc: "Proses print yang cepat dan efisien",
              },
              {
                icon: "🌍",
                title: "Terjangkau",
                desc: "Akses dari mana saja, kapan saja",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
