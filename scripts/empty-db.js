const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function emptyDatabase() {
  console.log("⚠️ Starting database data wipe (preserving all tables & schema)...");

  try {
    // Delete all records in atomic transaction respecting relationships
    const deleteLogs = prisma.activityLog.deleteMany({});
    const deleteGenerated = prisma.generatedContent.deleteMany({});
    const deleteApplications = prisma.application.deleteMany({});
    const deleteJobs = prisma.job.deleteMany({});
    const deleteProfiles = prisma.profile.deleteMany({});
    const deleteUsers = prisma.user.deleteMany({});

    await prisma.$transaction([
      deleteLogs,
      deleteGenerated,
      deleteApplications,
      deleteJobs,
      deleteProfiles,
      deleteUsers,
    ]);

    console.log("✅ All data records deleted successfully! Database tables are empty and ready.");
  } catch (error) {
    console.error("❌ Failed to empty database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

emptyDatabase();
