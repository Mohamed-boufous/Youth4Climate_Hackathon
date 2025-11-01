import { testimonials } from "../constants";

const Testimonials = () => {
  return (
    <div className="mt-20 tracking-wide">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center my-10 lg:my-20 text-white">
        Témoignages{" "}
        <span className="bg-gradient-to-r from-green-500 to-green-800 text-transparent bg-clip-text">
          sur GreenBrain
        </span>
      </h2>

      <div className="flex flex-wrap justify-center">
        {testimonials.map((t, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3 px-4 py-2">
            <div className="bg-neutral-900 rounded-md p-6 text-md border border-green-800/60 shadow-sm shadow-green-500/20">
              <p className="text-neutral-300">{t.text}</p>
              <div className="flex mt-8 items-start">
                <img
                  className="w-12 h-12 mr-6 rounded-full border-2 border-green-600"
                  src={t.image}
                  alt={t.user}
                />
                <div>
                  <h6 className="text-white">{t.user}</h6>
                  <span className="text-sm font-normal italic text-neutral-400">
                    {t.company}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
