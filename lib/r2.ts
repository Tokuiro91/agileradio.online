import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const accountId = process.env.R2_ACCOUNT_ID!
const accessKeyId = process.env.R2_ACCESS_KEY_ID!
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!
const bucketName = process.env.R2_BUCKET_NAME!
const publicUrl = process.env.R2_PUBLIC_URL! // e.g. https://pub-xxx.r2.dev

const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
})

/**
 * Upload a File to Cloudflare R2 and return its public URL.
 * @param file  - The File object from FormData
 * @param folder - Subfolder inside the bucket, e.g. "images" or "audio"
 */
export async function uploadToR2(file: File, folder: string): Promise<string> {
    const ext = file.name.split(".").pop() ?? "bin"
    const key = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const body = Buffer.from(arrayBuffer)

    await s3.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: body,
            ContentType: file.type || "application/octet-stream",
            // R2 serves files publicly when the bucket has public access enabled
        })
    )

    return `${publicUrl}/${key}`
}
