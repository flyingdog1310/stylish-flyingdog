import { pool } from "../util/mysql.js";
//---------------Create Product----------------------------------------
export async function createProduct(
    category,
    title,
    description,
    price,
    texture,
    wash,
    place,
    note,
    story,
    variants,
    main_image,
    images
) {
    try {
        const [productResult] = await pool.query(
            `
        INSERT INTO product (category,title, description, price, texture,wash,place,note, story,main_image)
        VALUES(?,?,?,?,?,?,?,?,?,?);
        `,
            [category, title, description, price, texture, wash, place, note, story, main_image]
        );
        for (let i = 0; i < variants.length; i++) {
            const [variantsResult] = await pool.query(
                `
        INSERT INTO variants (product_id,color_name,color_code,size,stock)
        VALUES(?,?,?,?,?);
        `,
                [
                    productResult.insertId,
                    variants[i].color_name,
                    variants[i].color_code,
                    variants[i].size,
                    variants[i].stock,
                ]
            );
        }
        for (let i = 0; i < images.length; i++) {
            const [imagesResult] = await pool.query(
                `
        INSERT INTO images (product_id,image)
        VALUES(?,?);
        `,
                [productResult.insertId, images[i]]
            );
        }
        console.log(productResult);
        return [productResult];
    } catch (err) {
        console.log(err);
        return err;
    }
}

//---------------Product List API--------------------------------------

async function getVariants(id) {
    const [variants] = await pool.query(
        `
      SELECT variants.color_name,variants.color_code,variants.size,variants.stock
      FROM variants
      WHERE product_id =?
      `,
        [id]
    );
    return variants;
}

function getColors(variantsArr) {
    const newColor = [];
    for (let i = 0; i < variantsArr.length; i++) {
        newColor[i] = {};
        newColor[i].code = variantsArr[i].color_code;
        newColor[i].name = variantsArr[i].color_name;
    }

    for (let i = 0; i < newColor.length; i++) {
        for (let j = i + 1; j < newColor.length; j++) {
            if (newColor[i].code === newColor[j].code) {
                newColor.splice(i, 1);
            }
        }
    }
    return newColor;
}

function getSizes(variantsArr) {
    const newSizes = [];
    for (let i = 0; i < variantsArr.length; i++) {
        newSizes[i] = variantsArr[i].size;
    }

    for (let i = 0; i < newSizes.length; i++) {
        for (let j = i + 1; j < newSizes.length; j++) {
            if (newSizes[i] === newSizes[j]) {
                newSizes.splice(i, 1);
            }
        }
    }
    return newSizes;
}

async function getImages(id) {
    const [rows] = await pool.query(
        `
      SELECT images.image
      FROM images
      WHERE product_id =?
      `,
        [id]
    );
    let images = await rows.map(function (obj) {
        return obj.image;
    });
    return images;
}

export async function getProduct(category, paging) {
    let products;
    let pages;
    if (category == "all") {
        [products] = await pool.query(
            `
          SELECT product.id, product.category,product.title,product.description,product.price,product.texture,product.wash,product.place,product.note,product.story,product.main_image
          FROM product 
          LIMIT ? , 6
          `,
            [paging * 6]
        );
        [[pages]] = await pool.query(
            `
            SELECT COUNT(*)
            FROM product 
            `
        );
    } else {
        [products] = await pool.query(
            `
      SELECT product.id, product.category,product.title,product.description,product.price,product.texture,product.wash,product.place,product.note,product.story,product.main_image
      FROM product 
      WHERE product.category = ?
      LIMIT ? , 6
      `,
            [category, paging * 6]
        );
        [[pages]] = await pool.query(
            `
        SELECT COUNT(*)
        FROM product 
        WHERE product.category= ?
        `,
            [category]
        );
    }
    let final = [];
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        let variants = await getVariants(product.id);
        product.colors = getColors(variants);
        product.sizes = getSizes(variants);
        for (let i = 0; i < variants.length; i++) {
            delete variants[i].color_name;
        }
        product.variants = variants;
        product.images = await getImages(product.id);
        final.push(product);
    }
    return [final, pages["COUNT(*)"]];
}
//--------------Product Search API-------------------------------------

export async function getProductSearch(keyword, paging) {
    let [rows] = await pool.query(
        `
      SELECT product.id, product.category,product.title,product.description,product.price,product.texture,product.wash,product.place,product.note,product.story,product.main_image
      FROM product 
      WHERE product.title LIKE ?
      LIMIT ? , 6
      `,
        [`%${keyword}%`, paging * 6]
    );
    let [[pages]] = await pool.query(
        `
        SELECT COUNT(*)
        FROM product 
        WHERE product.title LIKE ?
        `,
        [`%${keyword}%`]
    );
    let final = [];
    for (let i = 0; i < rows.length; i++) {
        let product = rows[i];
        let variants = await getVariants(product.id);
        product.colors = getColors(variants);
        product.sizes = getSizes(variants);
        for (let i = 0; i < variants.length; i++) {
            delete variants[i].color_name;
        }
        product.variants = variants;
        product.images = await getImages(product.id);
        final.push(product);
    }
    return [final, pages["COUNT(*)"]];
}
//------------- Product Detail API-------------------------------------
export async function getProductDetail(id) {
    let [rows] = await pool.query(
        `
      SELECT product.id, product.category,product.title,product.description,product.price,product.texture,product.wash,product.place,product.note,product.story,product.main_image
      FROM product 
      WHERE product.id = ?
      `,
        [id]
    );
    if (rows.length === 0) {
        return 0;
    } else {
        let final = [];
        for (let i = 0; i < rows.length; i++) {
            let product = rows[i];
            let variants = await getVariants(product.id);
            product.colors = getColors(variants);
            product.sizes = getSizes(variants);
            for (let i = 0; i < variants.length; i++) {
                delete variants[i].color_name;
            }
            product.variants = variants;
            product.images = await getImages(product.id);
            final.push(product);
        }
        return final;
    }
}
