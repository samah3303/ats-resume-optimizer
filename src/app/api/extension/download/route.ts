import { NextResponse } from "next/server";
import JSZip from "jszip";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const extDir = path.resolve(process.cwd(), "extension");
    if (!fs.existsSync(extDir)) {
      return NextResponse.json({ error: "Extension files not found." }, { status: 404 });
    }

    const zip = new JSZip();

    function addDirToZip(currentDir: string, zipFolder: JSZip) {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          if (subFolder) addDirToZip(fullPath, subFolder);
        } else {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(item, content);
        }
      }
    }

    addDirToZip(extDir, zip);

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="paniund-job-clipper.zip"',
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error("Extension download packaging error:", error);
    return NextResponse.json({ error: "Failed to package extension" }, { status: 500 });
  }
}
