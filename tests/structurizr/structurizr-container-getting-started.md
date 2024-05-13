C4Context
    Person(1, "User", "A user of my software system.")
    System_Boundary(2, "Software System") {
        Container(3, "Web Application")
        Container(4, "Database")
    }
    Rel(1, 3, "Uses")
    Rel(3, 4, "Reads from and writes to")
