
const { storefrontRequest } = require('../utils/shopifyClient');

// @desc    Get products from Shopify
// @route   GET /api/shopify/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { first = 20, query } = req.query;

    const gql = `
      query GetProducts($first: Int!, $query: String) {
        products(first: $first, query: $query) {
          edges {
            node {
              id
              title
              handle
              description
              availableForSale
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    quantityAvailable
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await storefrontRequest(gql, {
      first: parseInt(first),
      query: query || null,
    });

    res.json({
      success: true,
      data: data.products.edges.map(e => e.node),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// @desc    Create cart
// @route   POST /api/shopify/cart
// @access  Public
exports.createCart = async (req, res) => {
  try {
    const { lines } = req.body; // [{ merchandiseId, quantity }]

    if (!Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart lines required',
      });
    }

    const gql = `
      mutation CartCreate($lines: [CartLineInput!]) {
        cartCreate(input: { lines: $lines }) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const data = await storefrontRequest(gql, { lines });

    if (data.cartCreate.userErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: data.cartCreate.userErrors,
      });
    }

    res.json({
      success: true,
      data: data.cartCreate.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating cart',
      error: error.message,
    });
  }
};

// @desc    Add lines to cart
// @route   POST /api/shopify/cart/:id/lines
// @access  Public
exports.addCartLines = async (req, res) => {
  try {
    const { id } = req.params;
    const { lines } = req.body;

    const gql = `
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            totalQuantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const data = await storefrontRequest(gql, {
      cartId: id,
      lines,
    });

    if (data.cartLinesAdd.userErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: data.cartLinesAdd.userErrors,
      });
    }

    res.json({
      success: true,
      data: data.cartLinesAdd.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: error.message,
    });
  }
};

// @desc    Fetch cart
// @route   GET /api/shopify/cart/:id
// @access  Public
exports.getCart = async (req, res) => {
  try {
    const { id } = req.params;

    const gql = `
      query GetCart($id: ID!) {
        cart(id: $id) {
          id
          checkoutUrl
          totalQuantity
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    `;

    const data = await storefrontRequest(gql, { id });

    if (!data.cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    res.json({
      success: true,
      data: data.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message,
    });
  }
};
