user [icon: user]{
  id SERIAL PRIMARY KEY
  name VARCHAR(20)
  email VARCHAR(100)
  password_hash TEXT NOT NULL
  role VARCHAR(20) DEFAULT 'customer' CHECK(role IN ('admin','customer'))
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()
}
product [icon: oci-object-storage]{
  id SERIAL PRIMARY KEY
  name VARCHAR(150) NOT NULL
  description TEXT NOT NULL
  price DECIMAL(10,2) NOT NULL CHECK (price>=0)
  stock INT DEFAULT 0 CHECK (stock>=0)
  categoryId INT REFERENCE category(id) ON DELETE SET NULL
  image_url TEXT
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()
}
category [icon: tag]{
  id SERIAL PRIMARY KEY
  name VARCHAR(20) UNIQUE NOT NULL
  description TEXT
  created_at TIMESTAMP DEFAULT NOW()
}
cart [icon: bitbucket]{
  id SERIAL PRIMARY KEY
  userId INT REFERENCE user(id) ON DELETE CASCADE
  is_active BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()
}
cart_item [icon: bitbucket]{
 id SERIAL PRIMARY KEY
 cartId INT REFERENCE cart(id) ON DELETE CASCADE
 productId INT REFERENCE product(id) ON DELETE CASCADE
 quantity INT NOT NULL CHECK (quantity>0)
 UNIQUE(cartId,productId)
}
order [icon:safari]{
  id SERIAL PRIMARY KEY
  userId INT REFERENCE user(id) ON DELETE SET NULL
  total_amount NUMERIC(10,2) NOT NULL CHECK(total_amount>=0)
  status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending','paid','shipped','deliverd','canclled'))
  shipping_address TEXT
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()
}
order_item [icon:fast-forward]{
  id SERIAL PRIMARY KEY
  orderId INT REFERENCE order(id) ON DELETE CASCADE
  productId INT REFERENCE product(id) ON DELETE SET NULL
  quantity INT NOT NULL CHECK (quantity>0)
  price DECIMAL(10,2) NOT NULL CHECK (price>0)
  subtotal NUMERIC(10,2) GENERATED ALWAYS AS (quantity * price) STORED 
}
payment [icon:money]{
  id SERIAL PRIMARY KEY
  orderId INT REFERENCE order(id) ON DELETE CASCADE
  userId INT REFERENCE user(id) ON DELETE SET NULL
  payment_method VARCHAR(50) NOT NULL CHECK( payment_method IN ('stripe','razorpay','paypal'))
  amount NUMERIC(10,2) NOT NULL CHECK(amount>=0)
  status VARCHAR(50) DEFAULT 'initiated' CHECK (status IN ('initiated','successful','failed','refunded'))
  transactionId VARCHAR(150) UNIQUE
  created_at TIMESTAMP DEFAULT NOW()
}
