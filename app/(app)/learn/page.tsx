'use client';

import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function LearnPage() {
    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-10">
            {/* Header section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-2"
            >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-flow-primary to-flow-accent flex items-center justify-center shadow-float">
                    <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-flow-text">
                        Let's Learn
                    </h1>
                    <p className="text-flow-muted">
                        Understanding your body and menstrual cycle.
                    </p>
                </div>
            </motion.div>

            {/* Content Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="p-6 md:p-8 rounded-3xl border-[#ECDDD7]/50 bg-white/70 backdrop-blur-xl shadow-sm">
                    <div className="prose prose-pink max-w-none text-flow-muted">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-flow-primary" />
                            <h2 className="text-xl font-bold font-serif text-flow-text m-0">
                                What Is a Period?
                            </h2>
                        </div>
                        <p className="mb-4">
                            A period (also called menstruation) is a natural process that happens in the body, usually once every month. It is part of the reproductive system and is completely normal.
                        </p>
                        <p className="mb-4">
                            During a period, blood and tissue leave the body through the vagina. This happens because the body prepares every month for a possible pregnancy. If pregnancy does not happen, the extra lining inside the uterus is no longer needed, so the body removes it.
                        </p>
                        <p className="mb-8">
                            Most people get their first period between the ages of 9 and 16, and periods usually continue until menopause later in life.
                        </p>

                        <h3 className="text-lg font-bold font-serif text-flow-text mb-4">
                            Why Do Periods Happen?
                        </h3>
                        <p className="mb-2">
                            Inside the body, the uterus builds a soft lining every month. This lining is meant to support a baby if pregnancy occurs.
                        </p>
                        <p className="mb-2">If pregnancy does not happen:</p>
                        <ul className="list-disc pl-5 mb-8 space-y-1">
                            <li>the lining breaks down,</li>
                            <li>and leaves the body as menstrual blood.</li>
                        </ul>
                        <p className="mb-8">This monthly process is called the menstrual cycle.</p>

                        <h3 className="text-lg font-bold font-serif text-flow-text mb-4">
                            What Is a Menstrual Cycle?
                        </h3>
                        <p className="mb-2">
                            A menstrual cycle is the time from the first day of one period to the first day of the next period.
                        </p>
                        <p className="mb-2">For many people:</p>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                            <li>a cycle lasts around 21 to 35 days</li>
                            <li>and bleeding usually lasts 2 to 7 days</li>
                        </ul>
                        <p className="mb-8">Every body is different, so cycles can vary.</p>

                        <h3 className="text-lg font-bold font-serif text-flow-text mb-4">
                            Common Period Symptoms
                        </h3>
                        <p className="mb-2">
                            Some people feel completely normal during periods, while others may experience symptoms such as:
                        </p>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                            <li>cramps or stomach pain</li>
                            <li>bloating</li>
                            <li>tiredness</li>
                            <li>mood changes</li>
                            <li>headaches</li>
                            <li>acne</li>
                            <li>back pain</li>
                        </ul>
                        <p className="mb-8">These symptoms are common and can change from month to month.</p>

                        <h3 className="text-lg font-bold font-serif text-flow-text mb-4">
                            Period Products
                        </h3>
                        <p className="mb-2">
                            People use different products to manage menstrual bleeding, including:
                        </p>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                            <li>pads</li>
                            <li>tampons</li>
                            <li>menstrual cups</li>
                            <li>period underwear</li>
                        </ul>
                        <p className="mb-8">Choosing a product depends on comfort, lifestyle, and personal preference.</p>

                        <h3 className="text-lg font-bold font-serif text-flow-text mb-4">
                            Are Periods Normal?
                        </h3>
                        <p className="mb-4">
                            Yes. Periods are a healthy and natural part of life for many people. They are not dirty, embarrassing, or something to be ashamed of.
                        </p>
                        <p className="mb-8">
                            Learning about periods helps everyone — including teens, parents, friends, and boys — better understand the body and support others respectfully.
                        </p>

                        <h3 className="text-lg font-bold font-serif text-flow-text mb-4">
                            When Should Someone Talk to a Doctor?
                        </h3>
                        <p className="mb-2">
                            It’s a good idea to seek medical advice if periods:
                        </p>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                            <li>are extremely painful,</li>
                            <li>very heavy,</li>
                            <li>stop suddenly,</li>
                            <li>happen very irregularly,</li>
                            <li>or cause severe discomfort.</li>
                        </ul>
                        <p className="mb-8">Doctors can help identify and treat any underlying problems.</p>

                        <div className="p-6 rounded-2xl bg-flow-primary/5 border border-flow-primary/10 mt-8">
                            <h3 className="text-lg font-bold font-serif text-flow-text mb-3">
                                Important to Remember
                            </h3>
                            <ul className="list-disc pl-5 space-y-2 text-flow-text/90">
                                <li>Every person’s cycle is different.</li>
                                <li>Having questions about periods is completely normal.</li>
                                <li>Understanding periods helps reduce myths and stigma.</li>
                                <li>Everyone, regardless of gender, can learn about periods and reproductive health.</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Beginner's Guide Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="p-6 md:p-8 rounded-3xl border-[#ECDDD7]/50 bg-white/70 backdrop-blur-xl shadow-sm">
                    <div className="prose prose-pink max-w-none text-flow-muted">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-flow-primary" />
                            <h2 className="text-xl font-bold font-serif text-flow-text m-0">
                                Using Period Products — A Beginner’s Guide
                            </h2>
                        </div>
                        <p className="mb-8">
                            Getting your first period (called menarche) can feel confusing at first, but using period products becomes easier with practice. Everyone learns differently, and it’s okay to take time finding what feels comfortable for you.
                        </p>

                        <h3 className="text-lg font-bold font-serif text-flow-text mb-4">Pads</h3>
                        <p className="mb-2">
                            Pads are soft absorbent products that stick to underwear and collect menstrual blood outside the body. They are often the easiest option for beginners.
                        </p>
                        <p className="font-semibold text-flow-text mt-4 mb-2">How to Use a Pad</p>
                        <ol className="list-decimal pl-5 mb-4 space-y-1">
                            <li>Wash your hands.</li>
                            <li>Remove the pad from its wrapper.</li>
                            <li>Peel off the paper covering the sticky strip.</li>
                            <li>Stick the pad firmly inside your underwear.</li>
                            <li>If the pad has wings, fold them around the sides of the underwear.</li>
                            <li>Change the pad every 4–6 hours or sooner if it feels full.</li>
                        </ol>
                        <p className="font-semibold text-flow-text mb-2">Tips</p>
                        <ul className="list-disc pl-5 mb-8 space-y-1">
                            <li>Start with regular or medium-size pads.</li>
                            <li>Overnight pads are longer for extra protection while sleeping.</li>
                            <li>Carry an extra pad when going out.</li>
                        </ul>

                        <h3 className="text-lg font-bold font-serif text-flow-text mb-4">Tampons</h3>
                        <p className="mb-2">
                            Tampons are inserted inside the vagina to absorb menstrual blood internally. Some beginners may prefer to start with pads first, and that’s completely okay.
                        </p>
                        <p className="font-semibold text-flow-text mt-4 mb-2">How to Use a Tampon</p>
                        <ol className="list-decimal pl-5 mb-4 space-y-1">
                            <li>Wash your hands.</li>
                            <li>Relax your body and find a comfortable position.</li>
                            <li>Insert the tampon gently into the vagina using the applicator or your finger.</li>
                            <li>The string should stay outside the body.</li>
                            <li>Change it every 4–8 hours.</li>
                        </ol>
                        <div className="p-4 rounded-xl bg-flow-warning/10 border border-flow-warning/20 mb-4 text-flow-text/90">
                            <strong>Important Safety Tip:</strong> Never leave a tampon in for too long because it can increase the risk of a rare condition called Toxic Shock Syndrome (TSS).
                        </div>
                        <p className="font-semibold text-flow-text mb-2">Tips</p>
                        <ul className="list-disc pl-5 mb-8 space-y-1">
                            <li>Start with “light” or “regular” absorbency.</li>
                            <li>If it hurts, try adjusting the angle or relaxing more.</li>
                            <li>You should not feel it once inserted correctly.</li>
                        </ul>

                        <h3 className="text-lg font-bold font-serif text-flow-text mb-4">Menstrual Cups</h3>
                        <p className="mb-2">
                            Menstrual cups are flexible reusable cups inserted into the vagina to collect blood instead of absorbing it.
                        </p>
                        <p className="font-semibold text-flow-text mt-4 mb-2">How to Use a Menstrual Cup</p>
                        <ol className="list-decimal pl-5 mb-4 space-y-1">
                            <li>Wash your hands and rinse the cup.</li>
                            <li>Fold the cup.</li>
                            <li>Insert it gently into the vagina.</li>
                            <li>The cup opens inside to create a seal.</li>
                            <li>Remove, empty, wash, and reinsert every 6–12 hours depending on flow.</li>
                        </ol>
                        <p className="font-semibold text-flow-text mb-2">Tips</p>
                        <ul className="list-disc pl-5 mb-8 space-y-1">
                            <li>It may take a few tries to learn.</li>
                            <li>Relaxing helps insertion become easier.</li>
                            <li>Reusable cups are eco-friendly and can last for years with proper care.</li>
                        </ul>

                        <h3 className="text-lg font-bold font-serif text-flow-text mb-4">Period Underwear</h3>
                        <p className="mb-2">
                            Period underwear looks like regular underwear but has special absorbent layers built in.
                        </p>
                        <p className="font-semibold text-flow-text mt-4 mb-2">How to Use It</p>
                        <ol className="list-decimal pl-5 mb-4 space-y-1">
                            <li>Wear it like normal underwear.</li>
                            <li>Change depending on your flow.</li>
                            <li>Wash according to the instructions after use.</li>
                        </ol>
                        <p className="font-semibold text-flow-text mb-2">Tips</p>
                        <ul className="list-disc pl-5 mb-8 space-y-1">
                            <li>Good for school, sports, or overnight use.</li>
                            <li>Can also be combined with pads or tampons for extra protection.</li>
                        </ul>

                        <h3 className="text-lg font-bold font-serif text-flow-text mb-4">First Period Tips</h3>
                        <ul className="list-disc pl-5 mb-8 space-y-2">
                            <li>Carry a small period kit with pads, wipes, and extra underwear.</li>
                            <li>Tracking your cycle can help you feel prepared.</li>
                            <li>Leaks happen sometimes — it’s normal.</li>
                            <li>Ask a trusted adult, friend, doctor, or school nurse if you need help.</li>
                        </ul>

                        <div className="p-6 rounded-2xl bg-flow-primary/5 border border-flow-primary/10 mt-8">
                            <h3 className="text-lg font-bold font-serif text-flow-text mb-3">
                                Remember
                            </h3>
                            <p className="text-flow-text/90">
                                There is no “perfect” period product. What feels comfortable for one person may not feel comfortable for another. It’s okay to experiment and learn what works best for your body and lifestyle.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
