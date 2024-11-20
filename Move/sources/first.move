module metaschool::ResumeManager {
    use std::signer;
    use std::string::{String, utf8};

    struct Resume has key {
        name: String,
        email: String,
        phone: String,
        address: String,
        gender: String,
        marital_status: String,
        degree: String,
        description: String,
        skills: String,
        experience: String,
    }

    public entry fun create_resume(
        account: &signer,
        name: String,
        email: String,
        phone: String,
        address: String,
        gender: String,
        marital_status: String,
        degree: String,
        description: String,
        skills: String,
        experience: String
    ) acquires Resume {
        let addr = signer::address_of(account);

        if (exists<Resume>(addr)) {
            let resume = borrow_global_mut<Resume>(addr);
            resume.name = name;
            resume.email = email;
            resume.phone = phone;
            resume.address = address;
            resume.gender = gender;
            resume.marital_status = marital_status;
            resume.degree = degree;
            resume.description = description;
            resume.skills = skills;
            resume.experience = experience;
        } else {
            let new_resume = Resume {
                name,
                email,
                phone,
                address,
                gender,
                marital_status,
                degree,
                description,
                skills,
                experience,
            };
            move_to(account, new_resume);
        }
    }

    public fun get_resume(account: &signer): (String, String, String, String, String, String, String, String, String, String) acquires Resume {
        let addr = signer::address_of(account);
        assert!(exists<Resume>(addr), 0x1); 

        let resume = borrow_global<Resume>(addr);
        (
            resume.name,
            resume.email,
            resume.phone,
            resume.address,
            resume.gender,
            resume.marital_status,
            resume.degree,
            resume.description,
            resume.skills,
            resume.experience
        )
    }

    public entry fun update_marital_status(account: &signer, new_status: String) acquires Resume {
        let addr = signer::address_of(account);
        assert!(exists<Resume>(addr), 0x1); 

        let resume = borrow_global_mut<Resume>(addr);
        resume.marital_status = new_status;
    }

    public entry fun update_degree(account: &signer, new_degree: String) acquires Resume {
        let addr = signer::address_of(account);
        assert!(exists<Resume>(addr), 0x1); 

        let resume = borrow_global_mut<Resume>(addr);
        resume.degree = new_degree;
    }
}
