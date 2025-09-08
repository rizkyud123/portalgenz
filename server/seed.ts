import { storage } from "./storage";

async function seedData() {
  try {
    console.log('Starting database seed...');

    // Check if data already exists
    const existingUsers = await storage.getAllUsers();
    if (existingUsers.length > 0) {
      console.log('Database already seeded. Skipping...');
      return;
    }

    // Create admin user
    const adminUser = await storage.createUser({
      username: 'admin',
      password: 'admin123',
      email: 'admin@newsportal.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    console.log('Created admin user:', adminUser.username);

    // Create editor user  
    const editorUser = await storage.createUser({
      username: 'editor',
      password: 'editor123',
      email: 'editor@newsportal.com',
      firstName: 'Editor',
      lastName: 'User', 
      role: 'editor'
    });
    console.log('Created editor user:', editorUser.username);

    // Create categories
    const politikCategory = await storage.createCategory({
      name: 'Politik',
      slug: 'politik',
      description: 'Berita politik terkini dan analisis mendalam'
    });

    const ekonomiCategory = await storage.createCategory({
      name: 'Ekonomi', 
      slug: 'ekonomi',
      description: 'Update ekonomi, bisnis, dan keuangan'
    });

    const teknologiCategory = await storage.createCategory({
      name: 'Teknologi',
      slug: 'teknologi', 
      description: 'Perkembangan teknologi dan inovasi terbaru'
    });

    const olahragaCategory = await storage.createCategory({
      name: 'Olahraga',
      slug: 'olahraga',
      description: 'Berita olahraga dan pertandingan terkini'
    });

    const kesehatanCategory = await storage.createCategory({
      name: 'Kesehatan',
      slug: 'kesehatan',
      description: 'Tips kesehatan dan berita medis terkini'
    });

    console.log('Created categories');

    // Create sample articles
    const articles = [
      {
        title: 'Perkembangan Teknologi AI di Indonesia Tahun 2024',
        slug: 'perkembangan-teknologi-ai-indonesia-2024',
        excerpt: 'Indonesia mengalami pertumbuhan signifikan dalam adopsi teknologi artificial intelligence di berbagai sektor.',
        content: '<p>Indonesia sedang mengalami revolusi teknologi dengan berkembangnya artificial intelligence di berbagai sektor. Dari startup hingga perusahaan besar, semua berlomba mengimplementasikan AI untuk meningkatkan efisiensi dan inovasi.</p><p>Pemerintah juga memberikan dukungan penuh melalui berbagai program dan regulasi yang mendukung ekosistem AI nasional. Diharapkan Indonesia dapat menjadi leader regional dalam teknologi AI.</p><p>Beberapa sektor yang paling aktif mengadopsi AI antara lain:</p><ul><li>Perbankan dan finansial</li><li>E-commerce dan retail</li><li>Healthcare dan farmasi</li><li>Transportasi dan logistik</li><li>Pendidikan</li></ul>',
        categoryId: teknologiCategory.id,
        authorId: editorUser.id,
        status: 'published' as const,
        publishedAt: new Date()
      },
      {
        title: 'Pertumbuhan Ekonomi Digital Indonesia Mencapai Rekor Tertinggi',
        slug: 'pertumbuhan-ekonomi-digital-indonesia-rekor-tertinggi',
        excerpt: 'Sektor ekonomi digital Indonesia tumbuh pesat dan menjadi salah satu kontributor utama pertumbuhan ekonomi nasional.',
        content: '<p>Ekonomi digital Indonesia mengalami pertumbuhan yang luar biasa di tahun ini. E-commerce, fintech, dan platform digital lainnya berkontribusi signifikan terhadap PDB nasional.</p><p>Para ahli ekonomi optimis tren ini akan terus berlanjut seiring dengan meningkatnya penetrasi internet dan adopsi teknologi digital oleh masyarakat Indonesia.</p><p>Faktor pendorong pertumbuhan ekonomi digital:</p><ul><li>Penetrasi smartphone yang semakin tinggi</li><li>Infrastruktur internet yang membaik</li><li>Dukungan kebijakan pemerintah</li><li>Investasi asing yang terus mengalir</li></ul>',
        categoryId: ekonomiCategory.id,
        authorId: adminUser.id,
        status: 'published' as const,
        publishedAt: new Date()
      },
      {
        title: 'Tim Nasional Indonesia Meraih Prestasi Gemilang di Turnamen Asia',
        slug: 'tim-nasional-indonesia-prestasi-turnamen-asia',
        excerpt: 'Prestasi membanggakan diraih tim nasional Indonesia dalam turnamen bergengsi di kawasan Asia.',
        content: '<p>Tim nasional Indonesia berhasil meraih prestasi gemilang dalam turnamen sepak bola Asia yang diselenggarakan di Singapura. Dengan permainan yang solid dan strategi yang matang, Indonesia berhasil mengalahkan beberapa tim favorit.</p><p>Pencapaian ini menjadi bukti kemajuan sepak bola Indonesia dan memberikan harapan besar untuk turnamen-turnamen mendatang.</p><p>Kunci sukses tim nasional:</p><ul><li>Persiapan yang matang dan intensif</li><li>Kekompakan tim yang solid</li><li>Dukungan penuh dari PSSI</li><li>Mental juara yang kuat</li></ul>',
        categoryId: olahragaCategory.id,
        authorId: editorUser.id,
        status: 'published' as const,
        publishedAt: new Date()
      },
      {
        title: 'Kebijakan Baru Pemerintah dalam Mendukung UMKM Digital',
        slug: 'kebijakan-baru-pemerintah-umkm-digital',
        excerpt: 'Pemerintah meluncurkan serangkaian kebijakan baru untuk mendorong transformasi digital UMKM di seluruh Indonesia.',
        content: '<p>Dalam upaya meningkatkan daya saing UMKM Indonesia, pemerintah telah meluncurkan program komprehensif untuk mendukung transformasi digital. Program ini meliputi pelatihan, pendanaan, dan akses ke platform digital.</p><p>Diharapkan dengan program ini, UMKM Indonesia dapat lebih kompetitif di era digital dan berkontribusi lebih besar terhadap perekonomian nasional.</p><p>Program unggulan pemerintah:</p><ul><li>Bantuan digitalisasi UMKM</li><li>Pelatihan e-commerce gratis</li><li>Akses kredit dengan bunga rendah</li><li>Platform marketplace khusus UMKM</li></ul>',
        categoryId: politikCategory.id,
        authorId: adminUser.id,
        status: 'published' as const,
        publishedAt: new Date()
      },
      {
        title: 'Inovasi Startup Indonesia di Bidang Healthcare Technology',
        slug: 'inovasi-startup-indonesia-healthcare-technology',
        excerpt: 'Startup Indonesia mengembangkan solusi healthcare technology yang inovatif untuk meningkatkan akses layanan kesehatan.',
        content: '<p>Beberapa startup Indonesia telah mengembangkan teknologi healthcare yang revolusioner. Dari telemedicine hingga AI diagnostic, inovasi ini membantu meningkatkan akses dan kualitas layanan kesehatan di Indonesia.</p><p>Investor internasional mulai melirik potensi besar startup healthcare Indonesia, dengan beberapa sudah mendapat funding dalam jumlah signifikan.</p><p>Inovasi terbaru di healthcare tech:</p><ul><li>Telemedicine dengan AI assistant</li><li>Diagnostic tools berbasis machine learning</li><li>Platform kesehatan mental</li><li>Aplikasi monitoring kesehatan real-time</li></ul>',
        categoryId: kesehatanCategory.id,
        authorId: editorUser.id,
        status: 'published' as const,
        publishedAt: new Date()
      },
      {
        title: 'Tips Menjaga Kesehatan Mental di Era Digital',
        slug: 'tips-menjaga-kesehatan-mental-era-digital',
        excerpt: 'Panduan praktis untuk menjaga kesehatan mental di tengah pesatnya perkembangan teknologi digital.',
        content: '<p>Di era digital ini, menjaga kesehatan mental menjadi semakin penting. Paparan informasi yang berlebihan dan penggunaan gadget yang intensif dapat mempengaruhi kesejahteraan mental kita.</p><p>Para ahli psikologi memberikan beberapa tips praktis untuk menjaga keseimbangan mental di era digital.</p><p>Tips menjaga kesehatan mental:</p><ul><li>Batasi waktu penggunaan media sosial</li><li>Luangkan waktu untuk digital detox</li><li>Tetap aktif secara fisik</li><li>Jaga kualitas tidur</li><li>Berinteraksi secara langsung dengan orang lain</li></ul>',
        categoryId: kesehatanCategory.id,
        authorId: adminUser.id,
        status: 'draft' as const
      }
    ];

    for (const article of articles) {
      const created = await storage.createArticle(article);
      console.log('Created article:', created.title);
    }

    console.log('Database seeded successfully!');
    console.log('You can now log in with:');
    console.log('Admin: admin / admin123');
    console.log('Editor: editor / editor123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData();